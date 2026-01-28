import { openApiService } from "@/services/openapi.service.js";

export async function mapDependencies(url: string, args: any) {
  const result = await openApiService.mapDependencies(
    url,
    args.resourceName ? String(args.resourceName) : undefined
  );
  let text = "### Data Providers (Endpoints that return IDs):\n";
  result.providers.forEach(
    (p: any) => (text += `- ${p.method} ${p.path} (Provides: ${p.provides})\n`)
  );
  text += "\n### Data Consumers (Endpoints that require IDs):\n";
  result.consumers.forEach(
    (c: any) => (text += `- ${c.method} ${c.path} (Consumes: ${c.consumes} in ${c.in})\n`)
  );
  return { content: [{ type: "text", text }] };
}
