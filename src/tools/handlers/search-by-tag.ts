import { openApiService } from "@/services/openapi.service.js";

export async function searchByTag(url: string, args: any) {
  const tag = String(args?.tag);
  const spec = await openApiService.getSpec(url);
  const filtered: string[] = [];
  for (const [path, pathItem] of Object.entries(spec.paths || {})) {
    for (const [method, op] of Object.entries(pathItem || {})) {
      if ((op as any)?.tags?.includes(tag)) {
        filtered.push(
          `${method.toUpperCase()} ${path} - ${(op as any).summary || "No summary"}`,
        );
      }
    }
  }
  return {
    content: [
      {
        type: "text",
        text: filtered.length
          ? filtered.join("\n")
          : `No endpoints found for tag: ${tag}`,
      },
    ],
  };
}
