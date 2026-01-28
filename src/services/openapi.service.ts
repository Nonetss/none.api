import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPI } from "openapi-types";
import axios, { AxiosInstance } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import * as schemaUtils from "@/services/openapi/schema-utils.js";
import * as frameworkUtils from "@/services/openapi/framework-utils.js";
import * as specAnalyzer from "@/services/openapi/spec-analyzer.js";

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

  async getEndpoints(url: string) {
    const spec = await this.getSpec(url);
    return specAnalyzer.getEndpoints(spec);
  }

  async getEndpointInfo(url: string, path: string, method: string) {
    const spec = await this.getSpec(url);
    const op = (spec.paths as any)?.[path]?.[method.toLowerCase()];
    if (!op) throw new Error(`Endpoint ${method} ${path} not found`);
    return op;
  }

  async findEndpoints(url: string, query: string) {
    const spec = await this.getSpec(url);
    return specAnalyzer.findEndpoints(spec, query);
  }

  async getTags(url: string) {
    const spec = await this.getSpec(url);
    return specAnalyzer.getTags(spec);
  }

  jsonSchemaToTypeScript(schema: any, name: string): string {
    return schemaUtils.jsonSchemaToTypeScript(schema, name);
  }

  jsonSchemaToZod(schema: any): string {
    return schemaUtils.jsonSchemaToZod(schema);
  }

  generateMockData(schema: any, name: string = ""): any {
    return schemaUtils.generateMockData(schema, name);
  }

  getFrameworkSnippet(path: string, method: string, framework: 'axios' | 'tanstack-query', op: any): string {
    return frameworkUtils.getFrameworkSnippet(path, method, framework, op);
  }

  async getSecurityDetails(url: string, path?: string, method?: string) {
    const spec = await this.getSpec(url);
    return specAnalyzer.getSecurityDetails(spec, path, method);
  }

  async mapDependencies(url: string, resourceName?: string) {
    const spec = await this.getSpec(url);
    return specAnalyzer.mapDependencies(spec, resourceName);
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
}

export const openApiService = new OpenApiService();
