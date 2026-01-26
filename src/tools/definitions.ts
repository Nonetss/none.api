import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const TOOLS: Tool[] = [
  {
    name: "list_endpoints",
    description: "List all available endpoints. Uses default URL if not provided.",
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
        statusCode: { type: "string", description: "HTTP status code (default: '200')" },
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
        url: { type: "string", description: "Optional: OpenAPI URL" } 
      },
    },
  },
  {
    name: "get_typescript_types",
    description: "Generate TypeScript interfaces for an endpoint's request and response schemas.",
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
    description: "Generate Zod validation schema for an endpoint's request body.",
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
    name: "get_fetch_snippet",
    description: "Generate a ready-to-use JavaScript fetch snippet for an endpoint.",
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
    description: "Generate mock JSON data based on examples defined in the OpenAPI spec.",
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
    description: "Get security and authentication requirements for the API or a specific endpoint.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Optional: OpenAPI URL" },
        path: { type: "string" },
        method: { type: "string" },
      },
    },
  },
];