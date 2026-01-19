// BDL MCP Server - Cloudflare Workers Entry Point

import { BDLClient } from './bdl-client';
import { ToolHandler } from './tool-handler';
import { MCPServer, createSSEMessage, createSSEEndpoint } from './mcp-server';

// Environment interface
interface Env {
  BDL_API_BASE_URL: string;
  DEFAULT_LANGUAGE: string;
}

// Server info
const SERVER_INFO = {
  name: 'bdl-mcp-server',
  version: '1.0.0',
};

// Active SSE connections for session management
const sseConnections = new Map<string, { writer: WritableStreamDefaultWriter; encoder: TextEncoder }>();

// Parse JSON-RPC request
interface JSONRPCRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: unknown;
}

function isJSONRPCRequest(data: unknown): data is JSONRPCRequest {
  return (
    typeof data === 'object' &&
    data !== null &&
    'jsonrpc' in data &&
    (data as JSONRPCRequest).jsonrpc === '2.0' &&
    'method' in data
  );
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Session-Id',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id',
};

// Generate session ID
function generateSessionId(): string {
  return crypto.randomUUID();
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Initialize BDL client and MCP server
    const bdlClient = new BDLClient({
      baseUrl: env.BDL_API_BASE_URL || 'https://bdl.stat.gov.pl/api/v1',
      defaultLanguage: (env.DEFAULT_LANGUAGE as 'pl' | 'en') || 'pl',
    });
    const toolHandler = new ToolHandler(bdlClient);
    const mcpServer = new MCPServer(SERVER_INFO, toolHandler);

    // Route handling
    switch (path) {
      case '/':
      case '/health':
        return new Response(JSON.stringify({
          status: 'ok',
          server: SERVER_INFO,
          endpoints: {
            sse: '/sse',
            mcp: '/mcp',
          },
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });

      case '/sse':
        return handleSSE(request, mcpServer);

      case '/mcp':
        return handleMCP(request, mcpServer);

      default:
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
    }
  },
};

// Handle SSE connections (for MCP clients that use Server-Sent Events)
async function handleSSE(request: Request, mcpServer: MCPServer): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });
  }

  const sessionId = generateSessionId();
  
  // Create SSE stream
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  // Store connection
  sseConnections.set(sessionId, { writer, encoder });

  // Send initial endpoint message
  const endpointMessage = createSSEEndpoint();
  await writer.write(encoder.encode(endpointMessage));

  // Cleanup on close
  request.signal.addEventListener('abort', () => {
    sseConnections.delete(sessionId);
    writer.close().catch(() => {});
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Mcp-Session-Id': sessionId,
      ...corsHeaders,
    },
  });
}

// Handle MCP JSON-RPC requests (Streamable HTTP)
async function handleMCP(request: Request, mcpServer: MCPServer): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const body = await request.json();

    // Handle batch requests
    if (Array.isArray(body)) {
      const responses = await Promise.all(
        body.map(async (req) => {
          if (isJSONRPCRequest(req)) {
            return mcpServer.handleRequest(req);
          }
          return {
            jsonrpc: '2.0' as const,
            id: null,
            error: {
              code: -32600,
              message: 'Invalid Request',
            },
          };
        })
      );

      return new Response(JSON.stringify(responses), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Handle single request
    if (isJSONRPCRequest(body)) {
      // Check for session ID in header (for SSE-based sessions)
      const sessionId = request.headers.get('Mcp-Session-Id');
      
      const response = await mcpServer.handleRequest(body);

      // If this is an SSE session, also send via SSE
      if (sessionId && sseConnections.has(sessionId)) {
        const connection = sseConnections.get(sessionId)!;
        const sseMessage = createSSEMessage('message', response);
        await connection.writer.write(connection.encoder.encode(sseMessage));
      }

      return new Response(JSON.stringify(response), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    return new Response(JSON.stringify({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32600,
        message: 'Invalid Request',
      },
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32700,
        message: `Parse error: ${errorMessage}`,
      },
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}
