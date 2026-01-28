import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPI } from "openapi-types";
import axios, { AxiosInstance } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

export class OpenApiService {
  private securityContexts: { scope: string; headers: Record<string, string> }[] = [];
  private jar: CookieJar;
  private client: AxiosInstance;

  constructor() {
    this.jar = new CookieJar();
    this.client = wrapper(axios.create({ 
      jar: this.jar, 
      withCredentials: true 
    }));
  }

  public async ensureAuthenticated(specUrl: string) {
    const email = process.env.AUTH_EMAIL;
    const password = process.env.AUTH_PASSWORD;
    const authPath = process.env.AUTH_PATH;

    if (!email || !password || !authPath) return;

    let baseUrl = "";
    try {
      const url = new URL(specUrl);
      baseUrl = `${url.protocol}//${url.host}`;
    } catch (e) {}

    // Check if we already have cookies for this domain to avoid redundant auth calls
    const cookies = await this.jar.getCookies(baseUrl || specUrl);
    if (cookies.length > 0) return;

    try {
      const authUrl = authPath.startsWith("http") ? authPath : `${baseUrl}${authPath}`;
      console.error(`[OpenAPI] Attempting authentication to ${authUrl}...`);
      
      const response = await this.client.post(authUrl, { email, password }, {
        headers: { 
          'Content-Type': 'application/json',
          'Origin': baseUrl
        }
      });
      
      console.error(`[OpenAPI] Authentication successful: ${response.status} ${response.statusText}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const details = (error as any).response?.data ? JSON.stringify((error as any).response.data) : "";
      console.error(`[OpenAPI] Authentication failed: ${message} ${details}`);
    }
  }

  setSecurityContext(headers: Record<string, string>, scope: string = "*") {
    this.securityContexts = this.securityContexts.filter(s => s.scope !== scope);
    this.securityContexts.push({ scope, headers });
  }

  getSecurityHeaders(path: string, tags: string[] = []): Record<string, string> {
    let headers = {};
    const global = this.securityContexts.find(s => s.scope === "*");
    if (global) headers = { ...global.headers };

    for (const context of this.securityContexts) {
      if (tags.includes(context.scope) || path.startsWith(context.scope)) {
        headers = { ...headers, ...context.headers };
      }
    }
    return headers;
  }

  async getSpec(url: string): Promise<OpenAPI.Document> {
    await this.ensureAuthenticated(url);
    try {
      let origin = "";
      try {
        origin = new URL(url).origin;
      } catch (e) {}

      const response = await this.client.get(url, {
        headers: origin ? { 'Origin': origin, 'Referer': origin + "/" } : {}
      });
      const spec = await SwaggerParser.dereference(response.data);
      return spec as OpenAPI.Document;
    } catch (error) {
      try {
        const spec = await SwaggerParser.dereference(url);
        return spec as OpenAPI.Document;
      } catch (innerError) {
        throw new Error(`Failed to parse OpenAPI spec from ${url}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  private getHumanName(op: any, method: string, path: string): string {
    if (op.operationId) return op.operationId.replace(/[^a-zA-Z0-9]/g, '_');
    
    const parts = path.split('/').filter(p => p && !p.startsWith('{'));
    const resource = parts.length > 0 ? parts[parts.length - 1] : 'resource';
    const action = method.toLowerCase();
    
    const name = `${action}_${resource}`.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    return name;
  }

  async getEndpoints(url: string) {
    const spec = await this.getSpec(url) as any;
    const endpoints: { method: string; path: string; summary: string; fullPath?: string }[] = [];
    
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
            summary: op.summary || op.description || "No summary"
          });
        }
      }
    }
    return endpoints;
  }

  async getEndpointInfo(url: string, path: string, method: string) {
    const spec = await this.getSpec(url);
    const op = (spec.paths as any)?.[path]?.[method.toLowerCase()];
    if (!op) throw new Error(`Endpoint ${method} ${path} not found`);
    return op;
  }

  async findEndpoints(url: string, query: string) {
    const endpoints = await this.getEndpoints(url);
    const q = query.toLowerCase();
    return endpoints.filter(e => 
      e.path.toLowerCase().includes(q) || 
      e.summary.toLowerCase().includes(q) ||
      e.method.toLowerCase() === q
    );
  }

  async getTags(url: string) {
    const spec = await this.getSpec(url) as any;
    if (spec.tags && spec.tags.length > 0) {
      return spec.tags.map((t: any) => ({ name: t.name, description: t.description }));
    }
    
    const uniqueTags = new Set<string>();
    for (const pathItem of Object.values(spec.paths || {})) {
      for (const op of Object.values(pathItem || {})) {
        (op as any)?.tags?.forEach((t: string) => uniqueTags.add(t));
      }
    }
    return Array.from(uniqueTags).map(name => ({ name, description: "" }));
  }

  jsonSchemaToTypeScript(schema: any, name: string): string {
    if (!schema) return `export type ${name} = any;`;
    
    const parseSchema = (s: any, level: number = 0): string => {
      const indent = "  ".repeat(level);
      if (s.$ref) return s.$ref.split("/").pop();
      if (s.oneOf || s.anyOf) {
        return (s.oneOf || s.anyOf).map((option: any) => parseSchema(option, level)).join(" | ");
      }
      
      switch (s.type) {
        case "object":
          if (!s.properties) return "Record<string, any>";
          let obj = "{\n";
          for (const [prop, propSchema] of Object.entries(s.properties || {})) {
            const isRequired = (s.required || []).includes(prop);
            obj += `${indent}  ${prop}${isRequired ? "" : "?"}: ${parseSchema(propSchema, level + 1)};\n`;
          }
          obj += `${indent}}`;
          return obj;
        case "array":
          return `${parseSchema(s.items || {}, level)}[]`;
        case "string":
          return s.enum ? s.enum.map((e: string) => `'${e}'`).join(" | ") : "string";
        case "number":
        case "integer":
          return "number";
        case "boolean":
          return "boolean";
        default:
          return "any";
      }
    };

    return `export interface ${name} ${parseSchema(schema)}`;
  }

  jsonSchemaToZod(schema: any): string {
    if (!schema) return "z.any()";
    
    const parse = (s: any): string => {
      if (s.$ref) return `// Reference to ${s.$ref.split("/").pop()} - please check defined schemas`;
      
      switch (s.type) {
        case "object":
          let res = "z.object({\n";
          for (const [prop, propSchema] of Object.entries(s.properties || {})) {
            const isRequired = (s.required || []).includes(prop);
            res += `  ${prop}: ${parse(propSchema)}${isRequired ? "" : ".optional()"},
`;
          }
          res += "})";
          return res;
        case "array":
          return `z.array(${parse(s.items || {})})`;
        case "string":
          let str = "z.string()";
          if (s.enum) str = `z.enum([${s.enum.map((e: string) => `'${e}'`).join(", ")}])`;
          if (s.pattern) str += `.regex(/${s.pattern}/)`;
          if (s.minLength !== undefined) str += `.min(${s.minLength})`;
          if (s.maxLength !== undefined) str += `.max(${s.maxLength})`;
          if (s.format === "email") str += ".email()";
          if (s.format === "url") str += ".url()";
          return str;
        case "number":
        case "integer":
          let num = "z.number()";
          if (s.minimum !== undefined) num += `.min(${s.minimum})`;
          if (s.maximum !== undefined) num += `.max(${s.maximum})`;
          return num;
        case "boolean":
          return "z.boolean()";
        default:
          return "z.any()";
      }
    };

    return `import { z } from 'zod';\n\nexport const schema = ${parse(schema)};`;
  }

  generateMockData(schema: any, name: string = ""): any {
    if (!schema) return null;
    if (schema.example) return schema.example;
    
    const lowerName = name.toLowerCase();

    switch (schema.type) {
      case "object":
        const obj: any = {};
        for (const [prop, propSchema] of Object.entries(schema.properties || {})) {
          obj[prop] = this.generateMockData(propSchema, prop);
        }
        return obj;
      case "array":
        const count = Math.floor(Math.random() * 3) + 1;
        return Array(count).fill(0).map(() => this.generateMockData(schema.items || {}, name));
      case "string":
        if (schema.enum) return schema.enum[Math.floor(Math.random() * schema.enum.length)];
        if (lowerName.includes("avatar") || lowerName.includes("image") || lowerName.includes("img")) 
          return `https://picsum.photos/seed/${Math.random()}/200/300`;
        if (lowerName.includes("email")) return "dev.architect@example.com";
        if (lowerName.includes("name")) return "Jane Architect Doe";
        if (lowerName.includes("description") || lowerName.includes("content") || lowerName.includes("bio"))
          return "This is a high-fidelity semantic description generated to test layout constraints and text wrapping in a professional environment.";
        if (schema.format === "date-time") return new Date().toISOString();
        if (lowerName.includes("url") || schema.format === "uri") return "https://github.com/nonetss/none.api";
        return "Standard String";
      case "number":
      case "integer":
        if (lowerName.includes("price")) return 149.99;
        if (lowerName.includes("count") || lowerName.includes("total")) return 42;
        return 100;
      case "boolean":
        return true;
      default:
        return null;
    }
  }

  getFrameworkSnippet(path: string, method: string, framework: 'axios' | 'tanstack-query', op: any): string {
    const humanName = this.getHumanName(op, method, path);
    const operationName = humanName.charAt(0).toUpperCase() + humanName.slice(1);
    const hasBody = ["POST", "PUT", "PATCH"].includes(method.toUpperCase());
    
    let types = "";
    const reqSchema = op.requestBody?.content?.["application/json"]?.schema;
    const resSchema = op.responses?.["200"]?.content?.["application/json"]?.schema 
                   || op.responses?.["201"]?.content?.["application/json"]?.schema;

    if (reqSchema) types += this.jsonSchemaToTypeScript(reqSchema, `${operationName}Request`) + "\n";
    if (resSchema) types += this.jsonSchemaToTypeScript(resSchema, `${operationName}Response`) + "\n";

    const reqType = reqSchema ? `${operationName}Request` : "any";
    const resType = resSchema ? `${operationName}Response` : "any";

    const errorHandling = `catch (error) {
    console.error('Error in ${humanName}:', error);
    throw error;
  }`;

    if (framework === 'axios') {
      return `${types}
import axios from 'axios';

export const ${humanName} = async (data: ${reqType}): Promise<${resType}> => {
  try {
    const response = await axios({
      method: '${method.toLowerCase()}',
      url: \`\${process.env.NEXT_PUBLIC_API_URL}${path.replace(/{/g, '${data.')}\`,
      ${hasBody ? 'data,' : 'params: data,'}
    });
    return response.data;
  } \${errorHandling}
};`;
    }

    if (framework === 'tanstack-query') {
      const isMutation = hasBody || method.toUpperCase() === 'DELETE';
      if (isMutation) {
        return `${types}
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const use${operationName} = () => {
  const queryClient = useQueryClient();
  return useMutation<${resType}, Error, ${reqType}>({
    mutationFn: async (data) => {
      const response = await axios.${method.toLowerCase()}(\`${path.replace(/{/g, '${data.')}\`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error('Mutation failed:', error);
    }
  });
};
`;
      } else {
        return `${types}
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const use${operationName} = (params: ${reqType}) => {
  return useQuery<${resType}, Error>({
    queryKey: ['${humanName}', params],
    queryFn: async () => {
      const response = await axios.get(\`${path.replace(/{/g, '${params.')}\`, { params });
      return response.data;
    },
    retry: 1,
  });
};
`;
      }
    }
    return "";
  }

  async callEndpoint(
    specUrl: string, 
    path: string, 
    method: string, 
    options: {
      baseUrl?: string; 
      parameters?: Record<string, any>; 
      body?: any; 
      headers?: Record<string, any>
    }
  ) {
    const spec = await this.getSpec(specUrl) as any;
    const op = spec.paths?.[path]?.[method.toLowerCase()] || {};
    const tags = op.tags || [];
    
    let baseUrl = options.baseUrl;

    if (!baseUrl) {
      if (spec.servers && spec.servers.length > 0) {
        baseUrl = spec.servers[0].url;
        // Resolve relative baseUrl against specUrl if possible
        if (baseUrl && !baseUrl.startsWith("http") && specUrl.startsWith("http")) {
          try {
            baseUrl = new URL(baseUrl, specUrl).toString();
          } catch (e) {}
        }
      } else {
        try {
          const url = new URL(specUrl);
          baseUrl = `${url.protocol}//${url.host}`;
        } catch (e) {
          throw new Error("Could not infer Base URL. Please provide 'baseUrl'.");
        }
      }
    }

    let finalPath = path;
    const params = options.parameters || {};
    for (const [key, value] of Object.entries(params)) {
      if (finalPath.includes(`{${key}}`)) {
        finalPath = finalPath.replace(`{${key}}`, String(value));
        delete params[key];
      }
    }

    const fullUrl = new URL(finalPath, baseUrl);
    for (const [key, value] of Object.entries(params)) {
      fullUrl.searchParams.append(key, String(value));
    }

    const securityHeaders = this.getSecurityHeaders(path, tags);

    await this.ensureAuthenticated(specUrl);

    try {
      const origin = (baseUrl && baseUrl.startsWith("http")) ? new URL(baseUrl).origin : undefined;
      
      const response = await this.client({
        method: method.toLowerCase(),
        url: fullUrl.toString(),
        data: options.body,
        headers: {
          'Content-Type': 'application/json',
          ...(origin ? { 'Origin': origin, 'Referer': origin + "/" } : {}),
          ...securityHeaders,
          ...options.headers
        },
        validateStatus: () => true 
      });

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      };
    } catch (error: any) {
      return {
        error: error.message,
        details: error.response?.data
      };
    }
  }

  async mapDependencies(url: string, resourceName?: string) {
    const spec = await this.getSpec(url) as any;
    const providers: any[] = [];
    const consumers: any[] = [];

    for (const [path, pathItem] of Object.entries(spec.paths || {})) {
      for (const [method, op] of Object.entries(pathItem || {})) {
        const operation = op as any;
        const resSchema = operation.responses?.["200"]?.content?.["application/json"]?.schema 
                       || operation.responses?.["201"]?.content?.["application/json"]?.schema;

        if (resSchema) {
          const props = resSchema.properties || (resSchema.items?.properties);
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
        consumers: consumers.filter(filter)
      };
    }

    return { providers, consumers };
  }

  async getSecurityDetails(url: string, path?: string, method?: string) {
    const spec = await this.getSpec(url) as any;
    const globalSecurity = spec.security || [];
    const securitySchemes = spec.components?.securitySchemes || {};
    
    let endpointSecurity = null;
    if (path && method) {
      endpointSecurity = spec.paths?.[path]?.[method.toLowerCase()]?.security;
    }

    return {
      schemes: securitySchemes,
      required: endpointSecurity || globalSecurity
    };
  }
}

export const openApiService = new OpenApiService();