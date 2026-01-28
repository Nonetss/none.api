import { openApiService } from "@/services/openapi.service.js";

export async function getFetchSnippet(url: string, args: any) {
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
