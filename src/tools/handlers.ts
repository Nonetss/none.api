import { openApiService } from "../services/openapi.service.js";

export async function handleToolCall(name: string, args: any) {
  const url = String(args?.url || process.env.OPENAPI_URL || "");
  if (!url) {
    throw new Error("No OpenAPI URL provided. Please provide a 'url' argument or set the 'OPENAPI_URL' environment variable in your MCP configuration.");
  }

  switch (name) {
    case "list_endpoints": {
      const endpoints = await openApiService.getEndpoints(url);
      const text = endpoints.map(e => `${e.method} ${e.fullPath || e.path} - ${e.summary}`).join("\n");
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

    case "get_typescript_types": {
      const path = String(args.path);
      const method = String(args.method);
      const op = await openApiService.getEndpointInfo(url, path, method);
      
      let ts = "";
      const reqSchema = (op as any)?.requestBody?.content?.["application/json"]?.schema;
      if (reqSchema) {
        ts += openApiService.jsonSchemaToTypeScript(reqSchema, "Request") + "\n\n";
      }
      
      const resSchema = (op as any)?.responses?.["200"]?.content?.["application/json"]?.schema 
                    || (op as any)?.responses?.["201"]?.content?.["application/json"]?.schema;
      if (resSchema) {
        ts += openApiService.jsonSchemaToTypeScript(resSchema, "Response");
      }
      
      return { content: [{ type: "text", text: ts || "No JSON schemas found for this endpoint." }] };
    }

    case "get_zod_schema": {
      const path = String(args.path);
      const method = String(args.method);
      const target = args.target || "request";
      const statusCode = String(args.statusCode || "200");
      
      const op = await openApiService.getEndpointInfo(url, path, method);
      let schema;
      
      if (target === "request") {
        schema = (op as any)?.requestBody?.content?.["application/json"]?.schema;
      } else {
        let response = (op as any)?.responses?.[statusCode];
        if (!response && statusCode === "200") response = (op as any)?.responses?.["201"];
        schema = response?.content?.["application/json"]?.schema;
      }

      if (!schema) return { content: [{ type: "text", text: `No JSON schema found for ${target}.` }] };
      return { content: [{ type: "text", text: openApiService.jsonSchemaToZod(schema) }] };
    }

    case "get_fetch_snippet": {
      const path = String(args.path);
      const method = String(args.method).toUpperCase();
      const op = await openApiService.getEndpointInfo(url, path, method);
      
      const hasBody = ["POST", "PUT", "PATCH"].includes(method);
      const parameters = (op as any).parameters || [];
      const queryParams = parameters.filter((p: any) => p.in === "query");
      
      let code = `async function callApi(data) {\n`;
      code += `  const url = new URL('${path}', 'YOUR_BASE_URL');\n`;
      if (queryParams.length > 0) {
        code += `  // Query parameters\n`;
        queryParams.forEach((p: any) => {
          code += `  if (data.${p.name}) url.searchParams.append('${p.name}', data.${p.name});\n`;
        });
      }
      
      code += `\n  const response = await fetch(url.toString(), {\n`;
      code += `    method: '${method}',\n`;
      code += `    headers: {\n`;
      code += `      'Content-Type': 'application/json',\n`;
      code += `    },\n`;
      if (hasBody) {
        code += `    body: JSON.stringify(data),\n`;
      }
      code += `  });\n\n`;
      code += `  return response.json();\n`;
      code += `}`;
      
      return { content: [{ type: "text", text: code }] };
    }

    case "get_mock_data": {
      const op = await openApiService.getEndpointInfo(url, String(args.path), String(args.method));
      const resSchema = (op as any)?.responses?.["200"]?.content?.["application/json"]?.schema 
                    || (op as any)?.responses?.["201"]?.content?.["application/json"]?.schema;
      
      if (!resSchema) return { content: [{ type: "text", text: "No success response schema found." }] };
      const mock = openApiService.generateMockData(resSchema);
      return { content: [{ type: "text", text: JSON.stringify(mock, null, 2) }] };
    }

    case "get_security_info": {
      const details = await openApiService.getSecurityDetails(url, args.path ? String(args.path) : undefined, args.method ? String(args.method) : undefined);
      return { content: [{ type: "text", text: JSON.stringify(details, null, 2) }] };
    }

    case "call_endpoint": {
      const result = await openApiService.callEndpoint(url, String(args.path), String(args.method), {
        baseUrl: args.baseUrl,
        parameters: args.parameters,
        body: args.body,
        headers: args.headers
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }

    case "set_security_context": {
      openApiService.setSecurityContext(args.headers, args.scope);
      return { content: [{ type: "text", text: `Security context updated for scope: ${args.scope || '*'}.` }] };
    }

    case "find_endpoint": {
      const results = await openApiService.findEndpoints(url, String(args.query));
      const text = results.length > 0 
        ? results.map(e => `${e.method} ${e.fullPath || e.path} - ${e.summary}`).join("\n")
        : "No endpoints matched your search.";
      return { content: [{ type: "text", text }] };
    }

    case "map_dependencies": {
      const result = await openApiService.mapDependencies(url, args.resourceName ? String(args.resourceName) : undefined);
      let text = "### Data Providers (Endpoints that return IDs):\n";
      result.providers.forEach(p => text += `- ${p.method} ${p.path} (Provides: ${p.provides})\n`);
      text += "\n### Data Consumers (Endpoints that require IDs):\n";
      result.consumers.forEach(c => text += `- ${c.method} ${c.path} (Consumes: ${c.consumes} in ${c.in})\n`);
      return { content: [{ type: "text", text }] };
    }

    case "get_framework_snippet": {
      const op = await openApiService.getEndpointInfo(url, String(args.path), String(args.method));
      const snippet = openApiService.getFrameworkSnippet(String(args.path), String(args.method), args.framework as any, op);
      return { content: [{ type: "text", text: snippet }] };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
