import { openApiService } from "@/services/openapi.service.js";

export async function getResponseSchema(url: string, args: any) {
  const statusCode = String(args?.statusCode || "200");
  const op = await openApiService.getEndpointInfo(
    url,
    String(args.path),
    String(args.method),
  );

  let response = (op as any)?.responses?.[statusCode];
  if (!response && statusCode === "200")
    response = (op as any)?.responses?.["201"];

  // Try to get schema (handles both v2 and v3)
  const schema =
    response?.schema || response?.content?.["application/json"]?.schema;

  if (!schema)
    return {
      content: [
        {
          type: "text",
          text: `No JSON schema found for status ${statusCode}.`,
        },
      ],
    };
  return { content: [{ type: "text", text: JSON.stringify(schema, null, 2) }] };
}
