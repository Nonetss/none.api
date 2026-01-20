import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPI } from "openapi-types";
import axios from "axios";

export class OpenApiService {
  private specCache: Map<string, OpenAPI.Document> = new Map();

  async getSpec(url: string): Promise<OpenAPI.Document> {
    if (this.specCache.has(url)) return this.specCache.get(url)!;

    try {
      const response = await axios.get(url);
      const spec = await SwaggerParser.dereference(response.data);
      this.specCache.set(url, spec as OpenAPI.Document);
      return spec as OpenAPI.Document;
    } catch (error) {
      try {
        const spec = await SwaggerParser.dereference(url);
        this.specCache.set(url, spec as OpenAPI.Document);
        return spec as OpenAPI.Document;
      } catch (innerError) {
        throw new Error(`Failed to parse OpenAPI spec from ${url}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  async getEndpoints(url: string) {
    const spec = await this.getSpec(url);
    const endpoints: { method: string; path: string; summary: string }[] = [];
    
    for (const [path, pathItem] of Object.entries(spec.paths || {})) {
      for (const method of Object.keys(pathItem || {})) {
        if (["get", "post", "put", "delete", "patch"].includes(method)) {
          const op = (pathItem as any)[method];
          endpoints.push({
            method: method.toUpperCase(),
            path,
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
}

export const openApiService = new OpenApiService();
