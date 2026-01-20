# none.api MCP Server

Professional OpenAPI Explorer Model Context Protocol (MCP) server.

## Installation

To install from GitHub Packages, you need to configure your `.npmrc` to point to the GitHub registry:

```bash
echo "@nonete:registry=https://npm.pkg.github.com" >> .npmrc
```

Then install via npm:

```bash
npm install @nonete/none.api
```

## MCP Configuration

Add this to your `claude_desktop_config.json` or equivalent:

```json
{
  "mcpServers": {
    "none.api": {
      "command": "npx",
      "args": ["-y", "@nonete/none.api"],
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