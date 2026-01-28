import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const TOOLS: Tool[] = [
  {
    name: "list_endpoints",
    description:
      "PASO 1 (EXPLORACIÓN): Lista todos los endpoints. Úsalo SIEMPRE al inicio para conocer las rutas disponibles antes de desarrollar cualquier funcionalidad.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Límite de resultados (default: 50).",
        },
        offset: {
          type: "number",
          description: "Inicio de paginación (default: 0).",
        },
      },
    },
  },
  {
    name: "get_endpoint_info",
    description:
      "PASO 2 (ANÁLISIS): Obtiene detalles técnicos de un endpoint. Úsalo para entender los parámetros requeridos y la estructura de respuesta antes de programar.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Ruta del endpoint (ej: '/api/v1/users')",
        },
        method: {
          type: "string",
          description: "Método HTTP (GET, POST, etc.)",
        },
      },
      required: ["path", "method"],
    },
  },
  {
    name: "get_typescript_types",
    description:
      "FRONTEND (TIPADO): Genera interfaces TypeScript para las peticiones y respuestas. Úsalo para asegurar que tu frontend esté perfectamente tipado con el backend.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string" },
        method: { type: "string" },
      },
      required: ["path", "method"],
    },
  },
  {
    name: "get_zod_schema",
    description:
      "FRONTEND (VALIDACIÓN): Genera esquemas Zod. Úsalo para implementar validaciones de formularios en el frontend que coincidan con las reglas del backend.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string" },
        method: { type: "string" },
        target: {
          type: "string",
          enum: ["request", "response"],
          description: "Default: 'request'",
        },
        statusCode: { type: "string", description: "Default: '200'" },
      },
      required: ["path", "method"],
    },
  },
  {
    name: "get_framework_snippet",
    description:
      "FRONTEND (IMPLEMENTACIÓN): Genera hooks de TanStack Query o llamadas Axios. Úsalo para crear la capa de servicios de tu aplicación rápidamente.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string" },
        method: { type: "string" },
        framework: { type: "string", enum: ["axios", "tanstack-query"] },
      },
      required: ["path", "method", "framework"],
    },
  },
  {
    name: "validate_response",
    description:
      "BACKEND (TESTING): Valida si una respuesta JSON cumple con el contrato OpenAPI. ÚSALO SIEMPRE después de escribir código del backend para verificar que tu implementación es correcta.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string" },
        method: { type: "string" },
        statusCode: { type: "string", description: "Default: '200'" },
        data: {
          type: "object",
          description: "Objeto JSON generado por tu código a validar.",
        },
      },
      required: ["path", "method", "data"],
    },
  },
  {
    name: "get_mock_data",
    description:
      "FRONTEND (PROTOTIPADO): Genera datos ficticios que cumplen con el contrato. Úsalo para probar componentes UI antes de que el backend esté listo.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string" },
        method: { type: "string" },
      },
      required: ["path", "method"],
    },
  },
  {
    name: "find_endpoint",
    description:
      "BÚSQUEDA: Encuentra endpoints por palabras clave (ej: 'borrar usuario', 'upload'). Útil si no sabes la ruta exacta pero conoces la intención.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Término de búsqueda o intención.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "map_dependencies",
    description:
      "ARQUITECTURA: Analiza relaciones entre IDs de diferentes endpoints. Úsalo para entender cómo navegar por la API (ej: qué endpoint te da el ID que necesitas para otro).",
    inputSchema: {
      type: "object",
      properties: {
        resourceName: { type: "string", description: "Ej: 'user', 'album'." },
      },
    },
  },
  {
    name: "call_endpoint",
    description:
      "DEBUG: Realiza una petición real a la API configurada para verificar el comportamiento en vivo.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string" },
        method: { type: "string" },
        parameters: { type: "object" },
        body: { type: "object" },
        headers: { type: "object" },
      },
      required: ["path", "method"],
    },
  },
];
