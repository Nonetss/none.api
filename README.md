# none.api - OpenAPI Explorer MCP Server

[![English](https://img.shields.io/badge/lang-en-blue.svg)](#english)
[![Español](https://img.shields.io/badge/lang-es-yellow.svg)](#español)

---

<a name="english"></a>
## English

Professional OpenAPI explorer for the Model Context Protocol (MCP).

### What is this?

This MCP server allows Large Language Models (LLMs) like Claude or Cursor to **dynamically explore, understand, and interact with any API** that has an OpenAPI/Swagger specification.

Unlike other servers that map every endpoint to a tool (which can overwhelm the model's context), `none.api` acts as an intelligent inspector. It allows the model to:
- List available endpoints and methods.
- Search operations by functional tags.
- Retrieve detailed information and documentation for specific routes.
- Extract precise JSON Schemas for requests and responses.
- Understand the API structure without manual documentation pasting.

Optimized for backends following the [hono-template](https://github.com/Nonetss/hono-template) structure.

### Installation

#### Using npx (Recommended)
Run the server directly without installation:
```bash
npx @nonetss/none.api
```

#### Global Installation
```bash
npm install -g @nonetss/none.api
```

### MCP Configuration

Add this to your `claude_desktop_config.json` or equivalent (like Cursor):

```json
{
  "mcpServers": {
    "none.api": {
      "command": "npx",
      "args": ["-y", "@nonetss/none.api"],
      "env": {
        "OPENAPI_URL": "http://localhost:3000/doc"
      }
    }
  }
}
```

### Features
- **Endpoint Listing**: Overview of all available routes.
- **Tag Discovery**: List functional sections of the API.
- **Granular Schemas**: Fetch specific JSON Schemas for precise code generation.
- **Dynamic URLs**: Ability to point to different OpenAPI specs on the fly.

---

<a name="español"></a>
## Español

Explorador profesional de OpenAPI para el protocolo Model Context Protocol (MCP).

### ¿Qué es esto?

Este servidor MCP permite a los modelos de lenguaje (como Claude o Cursor) **explorar, entender e interactuar dinámicamente con cualquier API** que tenga una especificación OpenAPI/Swagger.

A diferencia de otros servidores que mapean cada endpoint a una herramienta (lo que puede saturar el contexto del modelo), `none.api` actúa como un inspector inteligente. Permite al modelo:
- Listar endpoints y métodos disponibles.
- Buscar operaciones por etiquetas funcionales.
- Obtener información detallada y documentación de rutas específicas.
- Extraer esquemas JSON precisos para peticiones y respuestas.
- Entender la estructura de la API sin necesidad de pegar la documentación manualmente.

Optimizado para backends que siguen la estructura de [hono-template](https://github.com/Nonetss/hono-template).

### Instalación

#### Usando npx (Recomendado)
Ejecuta el servidor directamente sin instalación previa:
```bash
npx @nonetss/none.api
```

#### Instalación Global
```bash
npm install -g @nonetss/none.api
```

### Configuración de MCP

Añade esto a tu archivo `claude_desktop_config.json` o equivalente (como Cursor):

```json
{
  "mcpServers": {
    "none.api": {
      "command": "npx",
      "args": ["-y", "@nonetss/none.api"],
      "env": {
        "OPENAPI_URL": "http://localhost:3000/doc"
      }
    }
  }
}
```

### Características
- **Listado de Endpoints**: Vista general de todas las rutas.
- **Descubrimiento de Etiquetas**: Listado de secciones funcionales de la API.
- **Esquemas Granulares**: Obtención de esquemas JSON específicos para generación de código precisa.
- **URLs Dinámicas**: Capacidad para apuntar a diferentes especificaciones OpenAPI en tiempo real.

---

### Development / Desarrollo

1. Clone the repo / Clona el repositorio.
2. `npm install`
3. `npm run build`
4. Configure `OPENAPI_URL` for testing / Configura `OPENAPI_URL` para pruebas.
