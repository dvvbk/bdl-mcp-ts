# BDL MCP Server

MCP (Model Context Protocol) Server for [Bank Danych Lokalnych (BDL)](https://bdl.stat.gov.pl/) API running on Cloudflare Workers.

## Overview

This server exposes the Polish Central Statistical Office (GUS) Local Data Bank API as MCP tools, allowing AI assistants like Claude to query statistical data about Poland's territorial units, demographics, economy, and more.

## Features

- 🚀 Runs on Cloudflare Workers (edge computing, global distribution)
- 📊 Full BDL API coverage with 25+ tools
- 🌐 Supports both Polish and English language responses
- 🔄 SSE and Streamable HTTP transport
- ✅ Type-safe with TypeScript and Zod validation

## Available Tools

### Aggregates
- `get_aggregates` - List aggregation levels (voivodeship, county, commune, etc.)
- `get_aggregate` - Get specific aggregation level details

### Attributes
- `get_attributes` - List data attributes/flags
- `get_attribute` - Get specific attribute details

### Levels
- `get_levels` - List territorial levels
- `get_level` - Get specific level details

### Measures
- `get_measures` - List measurement units
- `get_measure` - Get specific measure details

### Subjects (Statistical Categories)
- `get_subjects` - List statistical subjects/categories
- `get_subject` - Get specific subject details
- `search_subjects` - Search subjects by name

### Units (Territorial Divisions)
- `get_units` - List territorial units (voivodeships, counties, communes)
- `get_unit` - Get specific unit by TERYT code
- `search_units` - Search units by name

### Localities
- `get_localities` - List localities (cities, towns, villages)
- `get_locality` - Get specific locality details
- `search_localities` - Search localities by name

### Variables (Statistical Indicators)
- `get_variables` - List statistical variables
- `get_variable` - Get variable details including available years
- `search_variables` - Search variables by name

### Data
- `get_data_by_variable` - Get data for a variable across units
- `get_data_by_unit` - Get data for a unit across variables
- `get_locality_data_by_variable` - Get locality-level data by variable
- `get_locality_data_by_unit` - Get locality-level data by unit

### Years
- `get_years` - List available years in database
- `get_year` - Get specific year details

### Meta
- `get_api_version` - Get API version information

## Installation

### Prerequisites
- Node.js 18+
- Cloudflare account
- Wrangler CLI

### Setup

```bash
# Clone or copy the project
cd bdl-mcp-server

# Install dependencies
npm install

# Run locally
npm run dev

# Deploy to Cloudflare Workers
npm run deploy
```

## Configuration

Edit `wrangler.toml` to customize:

```toml
[vars]
BDL_API_BASE_URL = "https://bdl.stat.gov.pl/api/v1"
DEFAULT_LANGUAGE = "pl"  # or "en"
```

## Usage

### Connecting with Claude Desktop

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "bdl": {
      "url": "https://your-worker.your-subdomain.workers.dev/sse"
    }
  }
}
```

### Connecting with MCP Inspector

1. Start the server locally: `npm run dev`
2. Open MCP Inspector at `http://localhost:5173`
3. Connect to `http://localhost:8787/sse`

### Direct API Usage

**Health Check:**
```bash
curl https://your-worker.workers.dev/
```

**MCP Request (Streamable HTTP):**
```bash
curl -X POST https://your-worker.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

## Example Queries

### Get Population Data for Warsaw

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "search_units",
    "arguments": {
      "name": "Warszawa",
      "lang": "en"
    }
  }
}
```

### Get Available Statistical Variables for Demographics

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "search_variables",
    "arguments": {
      "name": "population",
      "lang": "en"
    }
  }
}
```

### Get Data for a Specific Variable

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "get_data_by_variable",
    "arguments": {
      "varId": 72305,
      "unitLevel": 2,
      "year": 2023,
      "lang": "en"
    }
  }
}
```

## Project Structure

```
bdl-mcp-server/
├── src/
│   ├── index.ts          # Cloudflare Workers entry point
│   ├── mcp-server.ts     # MCP protocol implementation
│   ├── tools.ts          # Tool definitions with Zod schemas
│   ├── tool-handler.ts   # Tool execution logic
│   ├── bdl-client.ts     # BDL API client
│   └── types.ts          # TypeScript types from Swagger
├── package.json
├── tsconfig.json
├── wrangler.toml         # Cloudflare Workers config
└── README.md
```

## Development

```bash
# Start development server with hot reload
npm run dev

# Type check
npm run build

# Deploy to production
npm run deploy
```

## API Reference

This server implements the [Model Context Protocol](https://modelcontextprotocol.io/) specification, exposing the [BDL API](https://bdl.stat.gov.pl/bdl/start) through MCP tools.

### Endpoints

- `GET /` - Health check and server info
- `GET /sse` - SSE connection for MCP clients
- `POST /mcp` - Streamable HTTP endpoint for JSON-RPC requests

### Transport

Supports both:
- **SSE (Server-Sent Events)** - For real-time bidirectional communication
- **Streamable HTTP** - For request/response style communication

## License

MIT

## Links

- [BDL API Documentation](https://bdl.stat.gov.pl/api/v1/swagger)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
