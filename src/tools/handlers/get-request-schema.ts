import { openApiService } from "@/services/openapi.service.js";

export async function getRequestSchema(url: string, args: any) {
  const op = await openApiService.getEndpointInfo(
    url,
    String(args.path),
    String(args.method),
  );

  // OpenAPI v3 style
  let schema = (op as any)?.requestBody?.content?.["application/json"]?.schema;

  // Swagger v2 style (parameters with in: 'body')
  if (!schema && (op as any).parameters) {
    const bodyParam = (op as any).parameters.find((p: any) => p.in === "body");
    if (bodyParam) {
      schema = bodyParam.schema;
    }
  }

  if (!schema)
    return {
      content: [{ type: "text", text: "No JSON request body schema found." }],
    };
  return { content: [{ type: "text", text: JSON.stringify(schema, null, 2) }] };
}
