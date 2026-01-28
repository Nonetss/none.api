import { openApiService } from "@/services/openapi.service.js";

export async function findEndpoint(url: string, args: any) {
  const results = await openApiService.findEndpoints(url, String(args.query));
  const text = results.length > 0 
    ? results.map((e: any) => `${e.method} ${e.fullPath || e.path} - ${e.summary}`).join("\n")
    : "No endpoints matched your search.";
  return { content: [{ type: "text", text }] };
}
