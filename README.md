# Servidor MCP none.api

Explorador profesional de OpenAPI para el protocolo Model Context Protocol (MCP).

## ¿Qué es esto?

Este servidor MCP permite a los modelos de lenguaje (como Claude o Cursor) **explorar, entender e interactuar con cualquier API que tenga una especificación OpenAPI/Swagger**. 

En lugar de copiar y pegar manualmente la documentación de una API, este servidor permite que el modelo consulte dinámicamente:
- Qué endpoints están disponibles.
- Qué parámetros requiere cada ruta.
- Cuáles son los esquemas de datos exactos (JSON Schema) para las peticiones y respuestas.
- Cómo están organizadas las funcionalidades mediante etiquetas (tags).

Es ideal para desarrolladores que necesitan integrar APIs de terceros o explorar sus propias APIs locales de forma asistida por IA.

Este servidor está diseñado y optimizado principalmente para trabajar con backends que siguen la estructura de [hono-template](https://github.com/Nonetss/hono-template).

## Instalación

### Usando npx (Recomendado)

Puedes ejecutar el servidor directamente sin instalación previa usando `npx`:

```bash
npx @nonetss/none.api
```

### Instalación Global

Para instalarlo globalmente vía npm:

```bash
npm install -g @nonetss/none.api
```

## Configuración de MCP

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

## Características

- **Listar Endpoints**: Ver todas las rutas disponibles.
- **Buscar por Etiqueta**: Filtrar endpoints por su categoría funcional.
- **Información Detallada**: Obtener todos los detalles de una operación.
- **Extracción de Esquemas**: Extraer esquemas JSON específicos de Petición (Request) y Respuesta (Response).
- **Descubrimiento de Etiquetas**: Listar todas las secciones de la API.

## Desarrollo

1. Clona el repositorio
2. `npm install`
3. `npm run build`
4. Configura la variable de entorno `OPENAPI_URL` para realizar pruebas.