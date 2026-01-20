import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const TOOLS: Tool[] = [
  {
    name: "list_endpoints",
    description: "List all available endpoints from an OpenAPI spec URL",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "OpenAPI JSON/YAML URL" },
      },
      required: ["url"],
    },
  },
  {
    name: "search_by_tag",
    description: "List all endpoints associated with a specific tag",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "OpenAPI JSON/YAML URL" },
        tag: { type: "string", description: "Tag name to filter by" },
      },
      required: ["url", "tag"],
    },
  },
  {
    name: "get_endpoint_info",
    description: "Get comprehensive info about an endpoint (description, params, security, etc.)",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string" },
        path: { type: "string" },
        method: { type: "string" },
      },
      required: ["url", "path", "method"],
    },
  },
  {
    name: "get_request_schema",
    description: "Get the detailed JSON schema required for the request body",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string" },
        path: { type: "string" },
        method: { type: "string" },
      },
      required: ["url", "path", "method"],
    },
  },
  {
    name: "get_response_schema",
    description: "Get the JSON schema of the expected response for a specific status code",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string" },
        path: { type: "string" },
        method: { type: "string" },
        statusCode: { type: "string", description: "HTTP status code (default: '200' or '201')" },
      },
      required: ["url", "path", "method"],
    },
  },
  {
    name: "list_tags",
    description: "List all tags defined in the specification",
    inputSchema: {
      type: "object",
      properties: { url: { type: "string" } },
      required: ["url"],
    },
  },
];
