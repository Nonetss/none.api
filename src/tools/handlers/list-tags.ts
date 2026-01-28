import { openApiService } from "@/services/openapi.service.js";

export async function listTags(url: string, args: any) {
  const tags = await openApiService.getTags(url);
  const text = tags
    .map(
      (t: { name: string; description?: string }) =>
        `${t.name}${t.description ? `: ${t.description}` : ""}`,
    )
    .join("\n");
  return { content: [{ type: "text", text }] };
}
