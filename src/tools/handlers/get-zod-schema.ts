import { openApiService } from "@/services/openapi.service.js";

export async function getZodSchema(url: string, args: any) {
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
