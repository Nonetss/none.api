import { OpenAPI, OpenAPIV3, OpenAPIV2 } from "openapi-types";

export interface EndpointInfo {
  method: string;
  path: string;
  summary: string;
  fullPath?: string;
}

export async function getEndpoints(
  spec: OpenAPI.Document,
): Promise<EndpointInfo[]> {
  const endpoints: EndpointInfo[] = [];
  const v3Spec = spec as OpenAPIV3.Document;
  const v2Spec = spec as OpenAPIV2.Document;

  const baseUrl = v3Spec.servers?.[0]?.url || v2Spec.basePath || "";
  let basePath = "";
  try {
    if (baseUrl && baseUrl.startsWith("/")) {
      basePath = baseUrl;
    } else if (baseUrl && baseUrl.startsWith("http")) {
      basePath = new URL(baseUrl).pathname;
    }
  } catch (e) {}

  if (basePath.endsWith("/")) basePath = basePath.slice(0, -1);

  const paths = spec.paths || {};
  for (const [path, pathItem] of Object.entries(paths)) {
    if (!pathItem) continue;

    for (const method of Object.keys(pathItem)) {
      if (["get", "post", "put", "delete", "patch"].includes(method)) {
        const op = (pathItem as any)[method];
        if (!op) continue;

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

export async function findEndpoints(
  spec: OpenAPI.Document,
  query: string,
): Promise<EndpointInfo[]> {
  const endpoints = await getEndpoints(spec);
  const synonyms: Record<string, string[]> = {
    borrar: ["delete", "remove", "destroy", "eliminate"],
    eliminar: ["delete", "remove", "destroy"],
    crear: ["post", "create", "add", "new"],
    buscar: ["get", "search", "find", "list", "query"],
    obtener: ["get", "find", "read"],
    actualizar: ["put", "patch", "update", "modify", "edit"],
    lista: ["list", "get", "all"],
    subir: ["upload", "post", "import"],
  };

  const originalWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const expandedWords = originalWords.flatMap((word) => [
    word,
    ...(synonyms[word] || []),
  ]);

  return endpoints.filter((e) => {
    const searchText = `${e.method} ${e.path} ${e.summary}`.toLowerCase();
    // Basta con que las palabras originales o sus sinónimos estén presentes
    return originalWords.every((original) => {
      const options = [original, ...(synonyms[original] || [])];
      return options.some((opt) => searchText.includes(opt));
    });
  });
}

export async function getTags(
  spec: OpenAPI.Document,
): Promise<{ name: string; description: string }[]> {
  const v3Spec = spec as OpenAPIV3.Document;
  if (v3Spec.tags && v3Spec.tags.length > 0) {
    return v3Spec.tags.map((t) => ({
      name: t.name,
      description: t.description || "",
    }));
  }

  const uniqueTags = new Set<string>();
  const paths = spec.paths || {};
  for (const pathItem of Object.values(paths)) {
    if (!pathItem) continue;
    for (const op of Object.values(pathItem)) {
      if (op && "tags" in (op as any)) {
        (op as any).tags?.forEach((t: string) => uniqueTags.add(t));
      }
    }
  }
  return Array.from(uniqueTags).map((name) => ({ name, description: "" }));
}

export interface DependencyMap {
  providers: { path: string; method: string; provides: string }[];
  consumers: { path: string; method: string; consumes: string; in: string }[];
}

export async function mapDependencies(
  spec: OpenAPI.Document,

  resourceName?: string,
): Promise<DependencyMap> {
  const providers: DependencyMap["providers"] = [];

  const consumers: DependencyMap["consumers"] = [];

  const paths = spec.paths || {};

  for (const [path, pathItem] of Object.entries(paths)) {
    if (!pathItem) continue;

    for (const [method, op] of Object.entries(pathItem)) {
      const operation = op as OpenAPIV3.OperationObject;

      if (!operation || typeof operation !== "object") continue;

      // 1. Encontrar qué IDs proporciona este endpoint (en la respuesta)

      const responses = operation.responses || {};

      const successRes = (responses["200"] ||
        responses["201"]) as OpenAPIV3.ResponseObject;

      const resSchema = successRes?.content?.["application/json"]
        ?.schema as OpenAPIV3.SchemaObject;

      if (resSchema) {
        const props =
          resSchema.properties || (resSchema as any).items?.properties;

        if (props) {
          for (const prop of Object.keys(props)) {
            // Buscamos campos que terminen en Id o sean 'id'

            if (
              prop.toLowerCase() === "id" ||
              prop.toLowerCase().endsWith("id")
            ) {
              // Intentamos deducir el tipo de recurso (ej: de 'GET /albums' sacamos 'album')

              const resource =
                prop.toLowerCase() === "id"
                  ? path
                      .split("/")
                      .filter((p) => p && p !== "api" && p !== "v0")
                      .pop()
                      ?.replace(/s$/, "") || "resource"
                  : prop.replace(/id$/i, "");

              providers.push({ path, method, provides: resource });
            }
          }
        }
      }

      // 2. Encontrar qué IDs consume (en parámetros)

      const parameters = (operation.parameters ||
        []) as OpenAPIV3.ParameterObject[];

      for (const p of parameters) {
        if (
          p.name &&
          (p.name.toLowerCase() === "id" || p.name.toLowerCase().endsWith("id"))
        ) {
          const resource =
            p.name.toLowerCase() === "id"
              ? path
                  .split("/")
                  .filter(
                    (p) => p && !p.startsWith("{") && p !== "api" && p !== "v0",
                  )
                  .pop()
                  ?.replace(/s$/, "") || "resource"
              : p.name.replace(/id$/i, "");

          consumers.push({ path, method, consumes: resource, in: p.in });
        }
      }
    }
  }

  if (resourceName) {
    const filter = (item: any) =>
      (item.provides || item.consumes)
        ?.toLowerCase()
        .includes(resourceName.toLowerCase());
    return {
      providers: providers.filter(filter),
      consumers: consumers.filter(filter),
    };
  }

  return { providers, consumers };
}

export async function getSecurityDetails(
  spec: OpenAPI.Document,
  path?: string,
  method?: string,
) {
  const v3Spec = spec as OpenAPIV3.Document;
  const globalSecurity = v3Spec.security || [];
  const securitySchemes = v3Spec.components?.securitySchemes || {};

  let endpointSecurity = null;
  if (path && method) {
    endpointSecurity = (v3Spec.paths?.[path] as any)?.[method.toLowerCase()]
      ?.security;
  }

  return {
    schemes: securitySchemes,
    required: endpointSecurity || globalSecurity,
  };
}
