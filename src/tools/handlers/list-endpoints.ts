import { openApiService } from "@/services/openapi.service.js";

export async function listEndpoints(url: string, args: any) {
  const limit = Number(args?.limit || 50);
  const offset = Number(args?.offset || 0);

  const allEndpoints = await openApiService.getEndpoints(url);
  const total = allEndpoints.length;
  const endpoints = allEndpoints.slice(offset, offset + limit);

  let text = `Showing ${offset + 1}-${Math.min(offset + limit, total)} of ${total} endpoints.\n\n`;
  text += endpoints
    .map((e: any) => `${e.method} ${e.fullPath || e.path} - ${e.summary}`)
    .join("\n");

  if (total > offset + limit) {
    text += `\n\n... and ${total - (offset + limit)} more. Use 'offset' and 'limit' parameters to paginate.`;
  }

  return { content: [{ type: "text", text }] };
}
