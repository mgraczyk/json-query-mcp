#!/usr/bin/env node
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { program } from 'commander';
import { createServerWithTools } from './server.js';

import packageJSON from '../package.json';

function setupExitWatchdog(server: McpServer) {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.stdin.on('close', async () => {
    setTimeout(() => process.exit(0), 15000);
    await server.close();
    process.exit(0);
  });
}

program
  .version('Version ' + packageJSON.version)
  .name(packageJSON.name)
  .action(async () => {
    const server = createServerWithTools({
      name: 'json-query',
      version: packageJSON.version,
    });
    setupExitWatchdog(server);

    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error('MCP server started');
  });
program.parse(process.argv);
