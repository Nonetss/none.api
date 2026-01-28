import { openApiService } from "@/services/openapi.service.js";

export async function callEndpoint(url: string, args: any) {
  const result = await openApiService.callEndpoint(url, String(args.path), String(args.method), {
    baseUrl: args.baseUrl,
    parameters: args.parameters,
    body: args.body,
    headers: args.headers
  });
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}
