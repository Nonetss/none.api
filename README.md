# OpenAPI Explorer MCP Server

Professional OpenAPI explorer for the Model Context Protocol (MCP), optimized for **Frontend Development** and **Backend Contract Verification**.

### What is this?

This MCP server allows Large Language Models (LLMs) like Claude or Cursor to dynamically explore, understand, and interact with any API that has an OpenAPI/Swagger specification.

It is specifically designed to:

1.  **Accelerate Frontend Development**: Generate types, Zod schemas, mock data, and data-fetching hooks (Axios/TanStack Query) directly from the API definition.
2.  **Verify Backend Implementation**: Validate backend response objects against the OpenAPI contract to ensure the implementation matches the specification.

### Key Features

- **Smart Exploration**: Categorized endpoint listing and keyword-based search (with multilingual synonym support).
- **Frontend Factory**:
  - Generate **TypeScript Interfaces** for requests and responses.
  - Generate **Zod Schemas** for form validation.
  - Generate **React/Axios/TanStack Query** snippets.
  - Generate **Mock Data** for UI prototyping.
- **Backend Guard**:
  - **Response Validation**: Compare JSON data against OpenAPI schemas using `AJV`.
  - **Dependency Mapping**: Understand relationships between resources (e.g., which endpoint provides the ID needed for another).
- **Security**: Automatic authentication support (Bearer/API Key) and secure environment-locked configuration.

### Tools Overview

| Tool                    | Focus        | Description                                                    |
| :---------------------- | :----------- | :------------------------------------------------------------- |
| `list_endpoints`        | Exploration  | Lists all endpoints grouped by functional categories.          |
| `find_endpoint`         | Exploration  | Intelligent search by intent or keyword (e.g., "delete user"). |
| `get_endpoint_info`     | Analysis     | Detailed documentation, parameters, and response codes.        |
| `get_typescript_types`  | Frontend     | Generates ready-to-use TypeScript interfaces.                  |
| `get_zod_schema`        | Frontend     | Generates Zod validation schemas.                              |
| `get_framework_snippet` | Frontend     | Generates Axios or TanStack Query code.                        |
| `validate_response`     | Backend      | Validates a JSON object against the API contract.              |
| `get_mock_data`         | Prototyping  | Generates high-fidelity mock data based on schemas.            |
| `map_dependencies`      | Architecture | Analyzes data flow and ID relationships between routes.        |
| `call_endpoint`         | Debug        | Executes real HTTP calls to the configured API.                |

### Configuration

Add this to your `claude_desktop_config.json` or Cursor MCP settings:

```json
{
  "mcpServers": {
    "openapi-explorer": {
      "command": "node",
      "args": ["/absolute/path/to/openapi/build/index.js"],
      "env": {
        "OPENAPI_URL": "http://localhost:3000/doc",
        "AUTH_EMAIL": "admin@example.com",
        "AUTH_PASSWORD": "your-password",
        "AUTH_PATH": "/api/auth/login"
      }
    }
  }
}
```

### Development Workflow

1.  **Build**: `npm run build` (uses `tsc` + `tsc-alias` for path resolution).
2.  **Formatting**: Prettier is included.
3.  **Git Hooks**: Automated formatting on commit via `husky` and `lint-staged`.
