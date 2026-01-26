import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPI } from "openapi-types";
import axios from "axios";

export class OpenApiService {
  async getSpec(url: string): Promise<OpenAPI.Document> {
    try {
      const response = await axios.get(url);
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

  jsonSchemaToTypeScript(schema: any, name: string): string {
    if (!schema) return `export type ${name} = any;`;
    
    const lines: string[] = [];
    
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
            res += `  ${prop}: ${parse(propSchema)}${isRequired ? "" : ".optional()"},\n`;
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

  generateMockData(schema: any): any {
    if (!schema) return null;
    if (schema.example) return schema.example;
    if (schema.examples && Array.isArray(schema.examples)) return schema.examples[0];
    if (schema.examples && typeof schema.examples === "object") return Object.values(schema.examples)[0];

    switch (schema.type) {
      case "object":
        const obj: any = {};
        for (const [prop, propSchema] of Object.entries(schema.properties || {})) {
          obj[prop] = this.generateMockData(propSchema);
        }
        return obj;
      case "array":
        return [this.generateMockData(schema.items || {})];
      case "string":
        if (schema.enum) return schema.enum[0];
        if (schema.format === "date-time") return new Date().toISOString();
        if (schema.format === "date") return new Date().toISOString().split("T")[0];
        if (schema.format === "email") return "user@example.com";
        return "string";
      case "number":
      case "integer":
        return 0;
      case "boolean":
        return true;
      default:
        return null;
    }
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
