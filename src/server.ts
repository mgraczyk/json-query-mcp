import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { z } from 'zod';
import path from 'path';

import { JsonUtils } from './jsonUtils.js';

interface Options {
  name: string;
  version: string;
}

const PATH_ARG_DESCRIPTION = "Absolute path to the JSON file.";

const getErrorResponse = (error: unknown): CallToolResult => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return {
    content: [
      {
        type: 'text',
        text: `Error: ${errorMessage}`,
      },
    ],
    isError: true,
  };
};

export function createServerWithTools(options: Options): McpServer {
  const { name, version } = options;

  const server = new McpServer({ name, version });

  // Tool 1: Query by JSONPath
  server.tool(
    'json_query_jsonpath',
    'Query a JSON file using JSONPath. Use to get values precisely from large JSON files.',
    {
      file_path: z.string().describe(PATH_ARG_DESCRIPTION),
      jsonpath: z.string().min(1).describe('JSONPath expression to evaluate'),
    },
    async ({ file_path, jsonpath }) => {
      try {
        const resolvedPath = path.resolve(file_path);

        const results = await JsonUtils.queryByJsonPath(jsonpath, resolvedPath);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      } catch (error) {
        return getErrorResponse(error);
      }
    },
  );

  // Tool 2: Search keys
  server.tool(
    'json_query_search_keys',
    'Search for keys in a JSON file. Use when you do not know the path to a key in a large JSON file, but have some idea what the key is.',
    {
      file_path: z.string().describe(PATH_ARG_DESCRIPTION),
      query: z.string().min(1).describe('Search term for finding matching keys'),
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .default(5)
        .describe('Maximum number of results to return (default: 5)'),
    },
    async ({ file_path, query, limit }) => {
      try {
        const resolvedPath = path.resolve(file_path);

        const results = await JsonUtils.searchKeys(query, resolvedPath, limit);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      } catch (error) {
        return getErrorResponse(error);
      }
    },
  );

  // Tool 3: Search values
  server.tool(
    'json_query_search_values',
    'Search for values in a JSON file. Use when you do not know the path to a value in a large JSON file, but have some idea what the value is.',
    {
      file_path: z.string().describe(PATH_ARG_DESCRIPTION),
      query: z.string().min(1).describe('Search term for finding matching values'),
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .default(5)
        .describe('Maximum number of results to return (default: 5)'),
    },
    async ({ file_path, query, limit }) => {
      try {
        const resolvedPath = path.resolve(file_path);

        const results = await JsonUtils.searchValues(query, resolvedPath, limit);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      } catch (error) {
        return getErrorResponse(error);
      }
    },
  );

  return server;
}
