import { openApiService } from "@/services/openapi.service.js";

export async function getMockData(url: string, args: any) {
  const op = await openApiService.getEndpointInfo(url, String(args.path), String(args.method));
  const resSchema = (op as any)?.responses?.["200"]?.content?.["application/json"]?.schema 
                || (op as any)?.responses?.["201"]?.content?.["application/json"]?.schema;
  
  if (!resSchema) return { content: [{ type: "text", text: "No success response schema found." }] };
  const mock = openApiService.generateMockData(resSchema);
  return { content: [{ type: "text", text: JSON.stringify(mock, null, 2) }] };
}
