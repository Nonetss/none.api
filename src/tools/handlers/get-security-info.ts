import { openApiService } from "@/services/openapi.service.js";

export async function getSecurityInfo(url: string, args: any) {
  const details = await openApiService.getSecurityDetails(
    url,
    args.path ? String(args.path) : undefined,
    args.method ? String(args.method) : undefined,
  );
  return {
    content: [{ type: "text", text: JSON.stringify(details, null, 2) }],
  };
}
