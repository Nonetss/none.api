import { openApiService } from "@/services/openapi.service.js";

export async function getEndpointInfo(url: string, args: any) {
  const info = await openApiService.getEndpointInfo(
    url,
    String(args.path),
    String(args.method),
  );
  return { content: [{ type: "text", text: JSON.stringify(info, null, 2) }] };
}
