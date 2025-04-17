Finishing implementing this MCP server (https://modelcontextprotocol.io/llms-full.txt) that does the following.
The server implements "json query" tools. This will be used to provide content from a very large json file to a model.
The MCP server should provide tools that do the following:
1. Query by JSONPath. Given a JSONPath, extract all the path evaluation against the provided json file
2. Search keys by string. Given a string, search for any keys that are close to that string. Returns a jsonpath to N matching keys sorted in relevance order (N=5 by default)
3. Search values. Given a value, search for any values that are close to that string. Returns JSONPaths of N matching values in relevance order (N=5 by default)

Write it in typescript using npm and node.
Please follow all common best practices and conventions.
Don't do anything clever or strange.
Document the code and make sure package.json is production ready.
Use eslint and prettier for formatting with default but strict configurations.

You still need to implement the tools and connect them to the server.
You should use the types from "@modelcontextprotocol/sdk/types.js" wherever possible.
Read the (https://modelcontextprotocol.io/llms-full.txt) to understand what is required.
Do not modify the readme or do anything else.
