import { openApiService } from "@/services/openapi.service.js";
import AjvModule from "ajv";
import addFormatsModule from "ajv-formats";

// Manejo de imports para ESM/CJS interop
const Ajv = (AjvModule as any).default || AjvModule;
const addFormats = (addFormatsModule as any).default || addFormatsModule;

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

export async function validateResponse(url: string, args: any) {
  const { path, method, data, statusCode = "200" } = args;

  const op = await openApiService.getEndpointInfo(url, path, method);
  let response = (op as any)?.responses?.[statusCode];
  if (!response && statusCode === "200")
    response = (op as any)?.responses?.["201"];

  const schema =
    response?.schema || response?.content?.["application/json"]?.schema;

  if (!schema) {
    return {
      content: [
        {
          type: "text",
          text: `No se encontró un esquema de respuesta para ${method} ${path} (${statusCode}).`,
        },
      ],
      isError: true,
    };
  }

  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (valid) {
    return {
      content: [
        {
          type: "text",
          text: "✅ La respuesta es válida y cumple con el contrato de OpenAPI.",
        },
      ],
    };
  } else {
    const errors = validate.errors
      ?.map(
        (err: any) =>
          `- ${err.instancePath} ${err.message} (${JSON.stringify(err.params)})`,
      )
      .join("\n");
    return {
      content: [
        {
          type: "text",
          text: `❌ Error de validación de contrato:\n${errors}\n\nEsquema esperado:\n${JSON.stringify(schema, null, 2)}`,
        },
      ],
      isError: true,
    };
  }
}
