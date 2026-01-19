// BDL MCP Server - Cloudflare Workers Entry Point

import { BDLClient } from './bdl-client';
import { ToolHandler } from './tool-handler';
import { MCPServer } from './mcp-server';

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
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

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
            mcp: '/mcp (POST)',
          },
          note: 'Send JSON-RPC 2.0 requests to /mcp endpoint',
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });

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

// Handle MCP JSON-RPC requests
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
      const response = await mcpServer.handleRequest(body);

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
