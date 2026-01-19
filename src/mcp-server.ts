// MCP Server implementation for Cloudflare Workers

import { z } from 'zod';
import { tools, type ToolName } from './tools';

// MCP Protocol types
interface JSONRPCRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: unknown;
}

interface JSONRPCResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

interface ServerInfo {
  name: string;
  version: string;
}

interface MCPCapabilities {
  tools?: Record<string, never>;
  resources?: Record<string, never>;
  prompts?: Record<string, never>;
}

interface InitializeResult {
  protocolVersion: string;
  capabilities: MCPCapabilities;
  serverInfo: ServerInfo;
}

interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface ListToolsResult {
  tools: ToolDefinition[];
}

interface CallToolParams {
  name: string;
  arguments?: Record<string, unknown>;
}

interface ToolResultContent {
  type: 'text';
  text: string;
}

interface CallToolResult {
  content: ToolResultContent[];
  isError?: boolean;
}

// Convert Zod schema to JSON Schema
function zodToJsonSchema(schema: z.ZodObject<z.ZodRawShape>): {
  type: 'object';
  properties: Record<string, unknown>;
  required?: string[];
} {
  const shape = schema.shape;
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const [key, value] of Object.entries(shape)) {
    const zodType = value as z.ZodTypeAny;
    properties[key] = zodTypeToJsonSchema(zodType);
    
    // Check if field is required (not optional)
    if (!zodType.isOptional()) {
      required.push(key);
    }
  }

  return {
    type: 'object',
    properties,
    ...(required.length > 0 ? { required } : {}),
  };
}

function zodTypeToJsonSchema(zodType: z.ZodTypeAny): Record<string, unknown> {
  // Handle optional wrapper
  if (zodType instanceof z.ZodOptional) {
    return zodTypeToJsonSchema(zodType._def.innerType);
  }

  // Handle nullable wrapper
  if (zodType instanceof z.ZodNullable) {
    return zodTypeToJsonSchema(zodType._def.innerType);
  }

  // Handle union types
  if (zodType instanceof z.ZodUnion) {
    const options = zodType._def.options.map((opt: z.ZodTypeAny) => zodTypeToJsonSchema(opt));
    return { oneOf: options };
  }

  // Handle enum
  if (zodType instanceof z.ZodEnum) {
    return {
      type: 'string',
      enum: zodType._def.values,
      description: zodType.description,
    };
  }

  // Handle string
  if (zodType instanceof z.ZodString) {
    return {
      type: 'string',
      description: zodType.description,
    };
  }

  // Handle number
  if (zodType instanceof z.ZodNumber) {
    const schema: Record<string, unknown> = {
      type: zodType._def.checks?.some((c: { kind: string }) => c.kind === 'int') ? 'integer' : 'number',
      description: zodType.description,
    };
    return schema;
  }

  // Handle boolean
  if (zodType instanceof z.ZodBoolean) {
    return {
      type: 'boolean',
      description: zodType.description,
    };
  }

  // Handle array
  if (zodType instanceof z.ZodArray) {
    return {
      type: 'array',
      items: zodTypeToJsonSchema(zodType._def.type),
      description: zodType.description,
    };
  }

  // Handle object
  if (zodType instanceof z.ZodObject) {
    return zodToJsonSchema(zodType);
  }

  // Default fallback
  return { type: 'string' };
}

export class MCPServer {
  private serverInfo: ServerInfo;
  private toolHandler: {
    execute: (name: ToolName, args: Record<string, unknown>) => Promise<CallToolResult>;
  };

  constructor(
    serverInfo: ServerInfo,
    toolHandler: { execute: (name: ToolName, args: Record<string, unknown>) => Promise<CallToolResult> }
  ) {
    this.serverInfo = serverInfo;
    this.toolHandler = toolHandler;
  }

  async handleRequest(request: JSONRPCRequest): Promise<JSONRPCResponse> {
    try {
      const result = await this.processMethod(request.method, request.params);
      return {
        jsonrpc: '2.0',
        id: request.id,
        result,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32603,
          message: errorMessage,
        },
      };
    }
  }

  private async processMethod(method: string, params: unknown): Promise<unknown> {
    switch (method) {
      case 'initialize':
        return this.handleInitialize();

      case 'tools/list':
        return this.handleListTools();

      case 'tools/call':
        return this.handleCallTool(params as CallToolParams);

      case 'ping':
        return {};

      case 'notifications/initialized':
        return {};

      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }

  private handleInitialize(): InitializeResult {
    return {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {},
      },
      serverInfo: this.serverInfo,
    };
  }

  private handleListTools(): ListToolsResult {
    const toolDefinitions: ToolDefinition[] = Object.entries(tools).map(([_, tool]) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: zodToJsonSchema(tool.inputSchema),
    }));

    return { tools: toolDefinitions };
  }

  private async handleCallTool(params: CallToolParams): Promise<CallToolResult> {
    const { name, arguments: args = {} } = params;

    // Validate tool exists
    if (!(name in tools)) {
      return {
        content: [{
          type: 'text',
          text: `Unknown tool: ${name}`,
        }],
        isError: true,
      };
    }

    // Validate arguments against schema
    const toolDef = tools[name as ToolName];
    const parseResult = toolDef.inputSchema.safeParse(args);

    if (!parseResult.success) {
      return {
        content: [{
          type: 'text',
          text: `Invalid arguments: ${parseResult.error.message}`,
        }],
        isError: true,
      };
    }

    // Execute the tool
    return this.toolHandler.execute(name as ToolName, parseResult.data);
  }
}

// SSE message helpers
export function createSSEMessage(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function createSSEEndpoint(): string {
  return `event: endpoint\ndata: /mcp\n\n`;
}
