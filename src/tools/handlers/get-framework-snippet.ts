import { openApiService } from "@/services/openapi.service.js";

export async function getFrameworkSnippet(url: string, args: any) {
  const op = await openApiService.getEndpointInfo(url, String(args.path), String(args.method));
  const snippet = openApiService.getFrameworkSnippet(
    String(args.path),
    String(args.method),
    args.framework as any,
    op
  );
  return { content: [{ type: "text", text: snippet }] };
}
