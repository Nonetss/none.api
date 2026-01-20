# none.api MCP Server

Professional OpenAPI Explorer Model Context Protocol (MCP) server.

## ¿Qué es esto? / What is this?

Este servidor MCP permite a los modelos de lenguaje (como Claude) **explorar, entender e interactuar con cualquier API que tenga una especificación OpenAPI/Swagger**. 

En lugar de copiar y pegar manualmente la documentación de una API, este servidor permite que el modelo consulte dinámicamente:
- Qué endpoints están disponibles.
- Qué parámetros requiere cada ruta.
- Cuáles son los esquemas de datos exactos (JSON Schema) para las peticiones y respuestas.
- Cómo están organizadas las funcionalidades mediante etiquetas (tags).

Es ideal para desarrolladores que necesitan integrar APIs de terceros o explorar sus propias APIs locales de forma asistida por IA.

---

This MCP server allows language models (like Claude) to **explore, understand, and interact with any API that has an OpenAPI/Swagger specification**.

Instead of manually copying and pasting API documentation, this server enables the model to dynamically query:
- Available endpoints.
- Parameters required for each route.
- Exact data schemas (JSON Schema) for requests and responses.
- Organization of features via tags.

It's perfect for developers who need to integrate third-party APIs or explore their own local APIs with AI assistance.

## Installation

### Using npx (Recommended)

You can run the server directly without installation using `npx`:

```bash
npx @nonetss/none.api
```

### Global Installation

To install globally via npm:

```bash
npm install -g @nonetss/none.api
```

## MCP Configuration

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

## Features

- **List Endpoints**: See all available routes.
- **Search by Tag**: Filter endpoints by their functional category.
- **Detailed Info**: Get full operation details.
- **Schema Extraction**: Extract specific Request and Response JSON schemas.
- **Tag Discovery**: List all API sections.

## Development

1. Clone the repo
2. `npm install`
3. `npm run build`
4. Set `OPENAPI_URL` environment variable for testing.
