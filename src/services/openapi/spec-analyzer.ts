import { OpenAPI } from "openapi-types";

export async function getEndpoints(spec: any) {
  const endpoints: {
    method: string;
    path: string;
    summary: string;
    fullPath?: string;
  }[] = [];

  const baseUrl = spec.servers?.[0]?.url || "";
  let basePath = "";
  try {
    if (baseUrl && baseUrl.startsWith("/")) {
      basePath = baseUrl;
    } else if (baseUrl) {
      basePath = new URL(baseUrl).pathname;
    }
  } catch (e) {}

  if (basePath.endsWith("/")) basePath = basePath.slice(0, -1);

  for (const [path, pathItem] of Object.entries(spec.paths || {})) {
    for (const method of Object.keys(pathItem || {})) {
      if (["get", "post", "put", "delete", "patch"].includes(method)) {
        const op = (pathItem as any)[method];
        const fullPath = `${basePath}${path}`;
        endpoints.push({
          method: method.toUpperCase(),
          path,
          fullPath: fullPath !== path ? fullPath : undefined,
          summary: op.summary || op.description || "No summary",
        });
      }
    }
  }
  return endpoints;
}

export async function findEndpoints(spec: any, query: string) {
  const endpoints = await getEndpoints(spec);
  const q = query.toLowerCase();
  return endpoints.filter(
    (e) =>
      e.path.toLowerCase().includes(q) ||
      e.summary.toLowerCase().includes(q) ||
      e.method.toLowerCase() === q,
  );
}

export async function getTags(spec: any) {
  if (spec.tags && spec.tags.length > 0) {
    return spec.tags.map((t: any) => ({
      name: t.name,
      description: t.description,
    }));
  }

  const uniqueTags = new Set<string>();
  for (const pathItem of Object.values(spec.paths || {})) {
    for (const op of Object.values(pathItem || {})) {
      (op as any)?.tags?.forEach((t: string) => uniqueTags.add(t));
    }
  }
  return Array.from(uniqueTags).map((name) => ({ name, description: "" }));
}

export async function mapDependencies(spec: any, resourceName?: string) {
  const providers: any[] = [];
  const consumers: any[] = [];

  for (const [path, pathItem] of Object.entries(spec.paths || {})) {
    for (const [method, op] of Object.entries(pathItem || {})) {
      const operation = op as any;
      const resSchema =
        operation.responses?.["200"]?.content?.["application/json"]?.schema ||
        operation.responses?.["201"]?.content?.["application/json"]?.schema;

      if (resSchema) {
        const props = resSchema.properties || resSchema.items?.properties;
        if (props) {
          for (const prop of Object.keys(props)) {
            if (prop.toLowerCase().endsWith("id")) {
              providers.push({ path, method, provides: prop });
            }
          }
        }
      }

      const parameters = operation.parameters || [];
      for (const p of parameters) {
        if (p.name.toLowerCase().endsWith("id")) {
          consumers.push({ path, method, consumes: p.name, in: p.in });
        }
      }
    }
  }

  if (resourceName) {
    const filter = (item: any) =>
      item.provides?.toLowerCase().includes(resourceName.toLowerCase()) ||
      item.consumes?.toLowerCase().includes(resourceName.toLowerCase());
    return {
      providers: providers.filter(filter),
      consumers: consumers.filter(filter),
    };
  }

  return { providers, consumers };
}

export async function getSecurityDetails(
  spec: any,
  path?: string,
  method?: string,
) {
  const globalSecurity = spec.security || [];
  const securitySchemes = spec.components?.securitySchemes || {};

  let endpointSecurity = null;
  if (path && method) {
    endpointSecurity = spec.paths?.[path]?.[method.toLowerCase()]?.security;
  }

  return {
    schemes: securitySchemes,
    required: endpointSecurity || globalSecurity,
  };
}
