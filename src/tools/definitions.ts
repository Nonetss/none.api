import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const TOOLS: Tool[] = [
  {
    name: "list_endpoints",
    description:
      "List all available endpoints. Uses default URL if not provided.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Optional: OpenAPI JSON/YAML URL" },
      },
    },
  },
  {
    name: "search_by_tag",
    description: "List all endpoints associated with a specific tag.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Optional: OpenAPI JSON/YAML URL" },
        tag: { type: "string", description: "Tag name to filter by" },
      },
      required: ["tag"],
    },
  },
  {
    name: "get_endpoint_info",
    description: "Get comprehensive info about an endpoint.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Optional: OpenAPI URL" },
        path: { type: "string" },
        method: { type: "string" },
      },
      required: ["path", "method"],
    },
  },
  {
    name: "get_request_schema",
    description: "Get the detailed JSON schema required for the request body.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Optional: OpenAPI URL" },
        path: { type: "string" },
        method: { type: "string" },
      },
      required: ["path", "method"],
    },
  },
  {
    name: "get_response_schema",
    description: "Get the JSON schema of the expected response.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Optional: OpenAPI URL" },
        path: { type: "string" },
        method: { type: "string" },
        statusCode: {
          type: "string",
          description: "HTTP status code (default: '200')",
        },
      },
      required: ["path", "method"],
    },
  },
  {
    name: "list_tags",
    description: "List all tags defined in the specification.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Optional: OpenAPI URL" },
      },
    },
  },
  {
    name: "get_typescript_types",
    description:
      "Generate TypeScript interfaces for an endpoint's request and response schemas.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Optional: OpenAPI URL" },
        path: { type: "string" },
        method: { type: "string" },
      },
      required: ["path", "method"],
    },
  },
  {
    name: "get_zod_schema",
    description:
      "Generate Zod validation schema for an endpoint's request or response body.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Optional: OpenAPI URL" },
        path: { type: "string" },
        method: { type: "string" },
        target: {
          type: "string",
          enum: ["request", "response"],
          description:
            "Generate schema for request body or response body (default: 'request')",
        },
        statusCode: {
          type: "string",
          description: "HTTP status code for response (default: '200')",
        },
      },
      required: ["path", "method"],
    },
  },
  {
    name: "get_fetch_snippet",
    description:
      "Generate a ready-to-use JavaScript fetch snippet for an endpoint.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Optional: OpenAPI URL" },
        path: { type: "string" },
        method: { type: "string" },
      },
      required: ["path", "method"],
    },
  },
  {
    name: "get_mock_data",
    description:
      "Generate mock JSON data based on examples defined in the OpenAPI spec.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Optional: OpenAPI URL" },
        path: { type: "string" },
        method: { type: "string" },
      },
      required: ["path", "method"],
    },
  },
  {
    name: "get_security_info",
    description:
      "Get security and authentication requirements for the API or a specific endpoint.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Optional: OpenAPI URL" },
        path: { type: "string" },
        method: { type: "string" },
      },
    },
  },
  {
    name: "call_endpoint",
    description: "Make a real HTTP request to an API endpoint.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "Optional: OpenAPI specification URL",
        },
        path: { type: "string", description: "Endpoint path" },
        method: { type: "string", description: "HTTP method" },
        baseUrl: {
          type: "string",
          description: "Base URL of the API (if not inferred from spec)",
        },
        parameters: {
          type: "object",
          description: "Path and query parameters",
        },
        body: {
          type: "object",
          description: "Request body for POST/PUT/PATCH",
        },
        headers: {
          type: "object",
          description: "Custom headers (merged with security context)",
        },
      },
      required: ["path", "method"],
    },
  },
  {
    name: "set_security_context",
    description:
      "Set security headers for a specific scope (tag, path prefix, or '*' for global).",
    inputSchema: {
      type: "object",
      properties: {
        headers: {
          type: "object",
          description:
            "Headers to include (e.g., {'Authorization': 'Bearer ...'})",
        },
        scope: {
          type: "string",
          description: "Scope: tag name, path prefix, or '*' (default: '*')",
        },
      },
      required: ["headers"],
    },
  },
  {
    name: "find_endpoint",
    description: "Search for endpoints by intent, description, or keyword.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Optional: OpenAPI URL" },
        query: {
          type: "string",
          description: "Search term (e.g., 'upload photo', 'delete user')",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "map_dependencies",
    description:
      "Analyze relationships between endpoints to see which endpoints provide data needed by others.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Optional: OpenAPI URL" },
        resourceName: {
          type: "string",
          description:
            "Optional: Filter by resource name (e.g., 'user', 'order')",
        },
      },
    },
  },
  {
    name: "get_framework_snippet",
    description:
      "Generate production-ready code for specific frameworks (Axios, TanStack Query).",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Optional: OpenAPI URL" },
        path: { type: "string" },
        method: { type: "string" },
        framework: {
          type: "string",
          enum: ["axios", "tanstack-query"],
          description: "Target framework",
        },
      },
      required: ["path", "method", "framework"],
    },
  },
];
