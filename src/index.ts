#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  const defaultUrl = process.env.OPENAPI_URL;
  console.error("OpenAPI Explorer Pro MCP server running on stdio");
  if (defaultUrl) {
    console.error(`Default OpenAPI URL configured: ${defaultUrl}`);
  } else {
    console.error("No default OpenAPI URL configured. Clients must provide the 'url' argument.");
  }
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
