import { openApiService } from "../services/openapi.service.js";

export async function handleToolCall(name: string, args: any) {
  const url = String(args?.url || process.env.OPENAPI_URL || "");
  if (!url) {
    throw new Error("No OpenAPI URL provided. Please provide a 'url' argument or set the 'OPENAPI_URL' environment variable in your MCP configuration.");
  }

  switch (name) {
    case "list_endpoints": {
      const endpoints = await openApiService.getEndpoints(url);
      const text = endpoints.map(e => `${e.method} ${e.path} - ${e.summary}`).join("\n");
      return { content: [{ type: "text", text }] };
    }

    case "search_by_tag": {
      const tag = String(args?.tag);
      const spec = await openApiService.getSpec(url);
      const filtered: string[] = [];
      for (const [path, pathItem] of Object.entries(spec.paths || {})) {
        for (const [method, op] of Object.entries(pathItem || {})) {
          if ((op as any)?.tags?.includes(tag)) {
            filtered.push(`${method.toUpperCase()} ${path} - ${(op as any).summary || "No summary"}`);
          }
        }
      }
      return { content: [{ type: "text", text: filtered.length ? filtered.join("\n") : `No endpoints found for tag: ${tag}` }] };
    }

    case "get_endpoint_info": {
      const info = await openApiService.getEndpointInfo(url, String(args.path), String(args.method));
      return { content: [{ type: "text", text: JSON.stringify(info, null, 2) }] };
    }

    case "get_request_schema": {
      const op = await openApiService.getEndpointInfo(url, String(args.path), String(args.method));
      const schema = (op as any)?.requestBody?.content?.["application/json"]?.schema;
      if (!schema) return { content: [{ type: "text", text: "No JSON request body schema found." }] };
      return { content: [{ type: "text", text: JSON.stringify(schema, null, 2) }] };
    }

    case "get_response_schema": {
      const statusCode = String(args?.statusCode || "200");
      const op = await openApiService.getEndpointInfo(url, String(args.path), String(args.method));
      let response = (op as any)?.responses?.[statusCode];
      if (!response && statusCode === "200") response = (op as any)?.responses?.["201"];
      const schema = response?.content?.["application/json"]?.schema;
      if (!schema) return { content: [{ type: "text", text: `No JSON schema found for status ${statusCode}.` }] };
      return { content: [{ type: "text", text: JSON.stringify(schema, null, 2) }] };
    }

    case "list_tags": {
      const tags = await openApiService.getTags(url);
      const text = tags.map((t: { name: string; description?: string }) => `${t.name}${t.description ? `: ${t.description}` : ""}`).join("\n");
      return { content: [{ type: "text", text }] };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
