# none.api MCP Server

Professional OpenAPI Explorer Model Context Protocol (MCP) server.

## Installation

### Using npx (Recommended)

You can run the server directly without installation using `npx`:

```bash
npx @nonetss/none.api
```

### Global Installation

To install globally via npm:

```bash
npm install -g @nonetss/none.api
```

## MCP Configuration

Add this to your `claude_desktop_config.json` or equivalent (like Cursor):

```json
{
  "mcpServers": {
    "none.api": {
      "command": "npx",
      "args": ["-y", "@nonetss/none.api"],
      "env": {
        "OPENAPI_URL": "http://localhost:3000/doc"
      }
    }
  }
}
```

## Features

- **List Endpoints**: See all available routes.
- **Search by Tag**: Filter endpoints by their functional category.
- **Detailed Info**: Get full operation details.
- **Schema Extraction**: Extract specific Request and Response JSON schemas.
- **Tag Discovery**: List all API sections.

## Development

1. Clone the repo
2. `npm install`
3. `npm run build`
4. Set `OPENAPI_URL` environment variable for testing.
