# OpenAPI Explorer MCP Server

Professional OpenAPI explorer for the Model Context Protocol (MCP).

### What is this?

This MCP server allows Large Language Models (LLMs) like Claude or Cursor to **dynamically explore, understand, and interact with any API** that has an OpenAPI/Swagger specification.

It acts as an intelligent inspector, allowing the model to:

- List available endpoints and methods.
- Search operations by functional tags.
- Retrieve detailed information and documentation for specific routes.
- Extract precise JSON Schemas for requests and responses.
- Understand the API structure without manual documentation pasting.

### MCP Configuration

Add this to your `claude_desktop_config.json` or equivalent (like Cursor):

```json
{
  "mcpServers": {
    "openapi-explorer": {
      "command": "node",
      "args": ["/path/to/project/build/index.js"],
      "env": {
        "OPENAPI_URL": "YOUR_OPENAPI_SPEC_URL"
      }
    }
  }
}
```

### Features

- **Endpoint Listing**: Overview of all available routes.
- **Tag Discovery**: List functional sections of the API.
- **Granular Schemas**: Fetch specific JSON Schemas for precise code generation.
- **Dynamic URLs**: Ability to point to different OpenAPI specs on the fly.
- **Testing Capabilities**: Call endpoints directly from the model.
- **Dependency Mapping**: Analyze relationships between endpoints.
- **Code Generation**: Generate TypeScript interfaces, Zod schemas, and fetch snippets.
