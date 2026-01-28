import { openApiService } from "@/services/openapi.service.js";

export async function listEndpoints(url: string, args: any) {
  const limit = Number(args?.limit || 50);
  const offset = Number(args?.offset || 0);

  const spec = (await openApiService.getSpec(url)) as any;
  const allEndpoints = await openApiService.getEndpoints(url);
  const total = allEndpoints.length;
  const endpoints = allEndpoints.slice(offset, offset + limit);

  // Agrupamos por tags para mejorar la legibilidad del modelo
  const grouped: Record<string, any[]> = {};

  for (const e of endpoints) {
    const op = spec.paths?.[e.path]?.[e.method.toLowerCase()];
    const tag = op?.tags?.[0] || "General";
    if (!grouped[tag]) grouped[tag] = [];
    grouped[tag].push(e);
  }

  let text = `Showing ${offset + 1}-${Math.min(offset + limit, total)} of ${total} endpoints.\n\n`;

  for (const [tag, items] of Object.entries(grouped)) {
    text += `### CATEGORY: ${tag.toUpperCase()}\n`;
    text += items.map((e) => `- ${e.method} ${e.fullPath || e.path} (${e.summary})`).join("\n");
    text += "\n\n";
  }

  if (total > offset + limit) {
    text += `\n... and ${total - (offset + limit)} more. Use 'offset' and 'limit' to see more categories.`;
  }

  return { content: [{ type: "text", text }] };
}
