import { openApiService } from "@/services/openapi.service.js";

export async function listEndpoints(url: string, args: any) {
  const endpoints = await openApiService.getEndpoints(url);
  const text = endpoints.map((e: any) => `${e.method} ${e.fullPath || e.path} - ${e.summary}`).join("\n");
  return { content: [{ type: "text", text }] };
}
