import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const TOOLS: Tool[] = [
  {
    name: "list_endpoints",
    description:
      "EXPLORACIÓN INICIAL: Lista todos los endpoints y métodos disponibles en la API configurada. Úsalo como primer paso para conocer las capacidades del sistema.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Límite de resultados a mostrar (default: 50).",
        },
        offset: {
          type: "number",
          description: "Índice de inicio para la paginación (default: 0).",
        },
      },
    },
  },
  {
    name: "search_by_tag",
    description:
      "BUSQUEDA POR CATEGORÍA: Lista endpoints agrupados por etiquetas (tags). Útil para encontrar todas las operaciones relacionadas con un recurso específico (ej: 'users', 'orders').",
    inputSchema: {
      type: "object",
      properties: {
        tag: { type: "string", description: "Nombre del tag para filtrar." },
      },
      required: ["tag"],
    },
  },
  {
    name: "get_endpoint_info",
    description:
      "DETALLES TÉCNICOS: Obtiene la documentación completa de un endpoint específico, incluyendo descripción, parámetros y posibles respuestas. Úsalo antes de intentar realizar una llamada con 'call_endpoint'.",
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
    name: "get_request_schema",
    description:
      "ESQUEMA DE PETICIÓN: Obtiene la estructura exacta del JSON requerido para el cuerpo de una petición (body). Esencial para construir objetos válidos en métodos POST, PUT o PATCH.",
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
    name: "get_response_schema",
    description:
      "ESQUEMA DE RESPUESTA: Muestra la estructura del JSON que devolverá el servidor. Útil para planificar cómo procesar los datos recibidos.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string" },
        method: { type: "string" },
        statusCode: {
          type: "string",
          description: "Código HTTP (por defecto '200')",
        },
      },
      required: ["path", "method"],
    },
  },
  {
    name: "list_tags",
    description:
      "ORGANIZACIÓN DE LA API: Lista todas las etiquetas (categorías) definidas en la API. Ayuda a entender la estructura lógica de los recursos.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_typescript_types",
    description:
      "GENERACIÓN DE TIPOS: Crea interfaces TypeScript automáticamente para los objetos de petición y respuesta de un endpoint.",
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
      "VALIDACIÓN: Genera un esquema de validación Zod para el cuerpo de la petición o respuesta.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string" },
        method: { type: "string" },
        target: {
          type: "string",
          enum: ["request", "response"],
          description: "Objetivo del esquema (default: 'request')",
        },
        statusCode: {
          type: "string",
          description: "Código HTTP para la respuesta (default: '200')",
        },
      },
      required: ["path", "method"],
    },
  },
  {
    name: "get_fetch_snippet",
    description:
      "IMPLEMENTACIÓN RÁPIDA: Genera un fragmento de código JavaScript usando 'fetch' para llamar al endpoint seleccionado.",
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
    name: "get_mock_data",
    description:
      "DATOS DE PRUEBA: Genera un ejemplo de datos ficticios (mock) basados en los esquemas de la API.",
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
    name: "get_security_info",
    description:
      "AUTENTICACIÓN: Muestra los requisitos de seguridad necesarios para interactuar con la API o un endpoint específico.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string" },
        method: { type: "string" },
      },
    },
  },
  {
    name: "call_endpoint",
    description:
      "EJECUCIÓN REAL: Realiza una petición HTTP real a la API. Debe usarse con precaución.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Ruta del endpoint." },
        method: { type: "string", description: "Método HTTP." },
        baseUrl: {
          type: "string",
          description:
            "URL base de ejecución (opcional, usa la de la spec por defecto).",
        },
        parameters: {
          type: "object",
          description: "Parámetros de ruta y consulta (query).",
        },
        body: { type: "object", description: "Cuerpo de la petición (JSON)." },
        headers: { type: "object", description: "Cabeceras adicionales." },
      },
      required: ["path", "method"],
    },
  },
  {
    name: "set_security_context",
    description:
      "CONFIGURACIÓN DE ACCESO: Establece cabeceras de seguridad globales (como 'Authorization').",
    inputSchema: {
      type: "object",
      properties: {
        headers: {
          type: "object",
          description:
            "Cabeceras de seguridad (ej: {'Authorization': 'Bearer token'})",
        },
        scope: {
          type: "string",
          description:
            "Ámbito: nombre de tag, prefijo de ruta o '*' para global (default: '*')",
        },
      },
      required: ["headers"],
    },
  },
  {
    name: "find_endpoint",
    description:
      "BÚSQUEDA INTELIGENTE: Encuentra endpoints basados en una intención o palabra clave. Ejemplo: 'subir foto', 'borrar usuario'.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Término de búsqueda o intención del usuario.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "map_dependencies",
    description:
      "ANÁLISIS DE FLUJO: Analiza qué endpoints proporcionan datos (IDs) que otros necesitan.",
    inputSchema: {
      type: "object",
      properties: {
        resourceName: {
          type: "string",
          description: "Opcional: Filtrar por recurso (ej: 'user').",
        },
      },
    },
  },
  {
    name: "get_framework_snippet",
    description:
      "CÓDIGO DE PRODUCCIÓN: Genera implementaciones completas para frameworks modernos (Axios o TanStack Query).",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string" },
        method: { type: "string" },
        framework: {
          type: "string",
          enum: ["axios", "tanstack-query"],
          description: "Framework objetivo.",
        },
      },
      required: ["path", "method", "framework"],
    },
  },
  {
    name: "validate_response",
    description:
      "BACKEND CHECK: Valida un objeto JSON (respuesta del backend) contra el esquema definido en OpenAPI para un endpoint y código de estado específicos. Útil para asegurar que la implementación cumple el contrato.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Ruta del endpoint." },
        method: { type: "string", description: "Método HTTP." },
        statusCode: {
          type: "string",
          description: "Código de estado esperado (default: '200').",
        },
        data: {
          type: "object",
          description: "El objeto JSON que se desea validar.",
        },
      },
      required: ["path", "method", "data"],
    },
  },
];
