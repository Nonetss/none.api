import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { TOOLS } from "@/tools/definitions.js";
import { handleToolCall } from "@/tools/handlers.js";
import { openApiService } from "@/services/openapi.service.js";

export function createServer() {
  const server = new Server(
    {
      name: "openapi-explorer-pro",
      version: "0.2.0",
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    const url = process.env.OPENAPI_URL;
    return {
      resources: url
        ? [
            {
              uri: "openapi://spec",
              name: "Current OpenAPI Specification",
              mimeType: "application/json",
              description: "The full de-referenced OpenAPI specification currently in use.",
            },
          ]
        : [],
    };
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    if (request.params.uri === "openapi://spec") {
      const url = process.env.OPENAPI_URL;
      if (!url) throw new Error("No default OPENAPI_URL configured");
      const spec = await openApiService.getSpec(url);
      return {
        contents: [
          {
            uri: "openapi://spec",
            mimeType: "application/json",
            text: JSON.stringify(spec, null, 2),
          },
        ],
      };
    }
    throw new Error(`Resource not found: ${request.params.uri}`);
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      return await handleToolCall(request.params.name, request.params.arguments);
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}
