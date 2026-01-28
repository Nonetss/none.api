import { openApiService } from "@/services/openapi.service.js";

export async function getRequestSchema(url: string, args: any) {
  const op = await openApiService.getEndpointInfo(url, String(args.path), String(args.method));
  const schema = (op as any)?.requestBody?.content?.["application/json"]?.schema;
  if (!schema) return { content: [{ type: "text", text: "No JSON request body schema found." }] };
  return { content: [{ type: "text", text: JSON.stringify(schema, null, 2) }] };
}
