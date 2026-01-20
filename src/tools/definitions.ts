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
];