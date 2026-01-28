import { openApiService } from "@/services/openapi.service.js";

export async function setSecurityContext(url: string, args: any) {
  openApiService.setSecurityContext(args.headers, args.scope);
  return { content: [{ type: "text", text: `Security context updated for scope: ${args.scope || '*'}.` }] };
}
