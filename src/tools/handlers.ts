import * as handlers from "@/tools/handlers/index.js";

export async function handleToolCall(name: string, args: any) {
  // Sacred URL from environment variables only
  const url = process.env.OPENAPI_URL || "";

  if (!url && name !== "set_security_context") {
    throw new Error(
      "OPENAPI_URL environment variable is not set in the MCP configuration. This server is locked to its environment configuration.",
    );
  }

  switch (name) {
    case "list_endpoints":
      return handlers.listEndpoints(url, args);
    case "search_by_tag":
      return handlers.searchByTag(url, args);
    case "get_endpoint_info":
      return handlers.getEndpointInfo(url, args);
    case "get_request_schema":
      return handlers.getRequestSchema(url, args);
    case "get_response_schema":
      return handlers.getResponseSchema(url, args);
    case "list_tags":
      return handlers.listTags(url, args);
    case "get_typescript_types":
      return handlers.getTypeScriptTypes(url, args);
    case "get_zod_schema":
      return handlers.getZodSchema(url, args);
    case "get_fetch_snippet":
      return handlers.getFetchSnippet(url, args);
    case "get_mock_data":
      return handlers.getMockData(url, args);
    case "get_security_info":
      return handlers.getSecurityInfo(url, args);
    case "call_endpoint":
      return handlers.callEndpoint(url, args);
    case "set_security_context":
      return handlers.setSecurityContext(url, args);
    case "find_endpoint":
      return handlers.findEndpoint(url, args);
    case "map_dependencies":
      return handlers.mapDependencies(url, args);
    case "get_framework_snippet":
      return handlers.getFrameworkSnippet(url, args);
    case "validate_response":
      return handlers.validateResponse(url, args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
