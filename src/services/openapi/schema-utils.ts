export function jsonSchemaToTypeScript(schema: any, name: string): string {
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

export function jsonSchemaToZod(schema: any): string {
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

export function generateMockData(schema: any, name: string = ""): any {
  if (!schema) return null;
  if (schema.example) return schema.example;
  
  const lowerName = name.toLowerCase();

  switch (schema.type) {
    case "object":
      const obj: any = {};
      for (const [prop, propSchema] of Object.entries(schema.properties || {})) {
        obj[prop] = generateMockData(propSchema, prop);
      }
      return obj;
    case "array":
      const count = Math.floor(Math.random() * 3) + 1;
      return Array(count).fill(0).map(() => generateMockData(schema.items || {}, name));
    case "string":
      if (schema.enum) return schema.enum[Math.floor(Math.random() * schema.enum.length)];
      if (lowerName.includes("avatar") || lowerName.includes("image") || lowerName.includes("img")) 
        return `https://picsum.photos/seed/${Math.random()}/200/300`;
      if (lowerName.includes("email")) return "dev.architect@example.com";
      if (lowerName.includes("name")) return "Jane Architect Doe";
      if (lowerName.includes("description") || lowerName.includes("content") || lowerName.includes("bio"))
        return "This is a high-fidelity semantic description generated to test layout constraints and text wrapping in a professional environment.";
            if (schema.format === "date-time") return new Date().toISOString();
              if (lowerName.includes("url") || schema.format === "uri") return "https://example.com/api";
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
