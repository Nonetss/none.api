import { openApiService } from "@/services/openapi.service.js";

export async function getTypeScriptTypes(url: string, args: any) {
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
