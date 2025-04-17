import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// For ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main(): Promise<void> {
  const exampleJsonPath = path.resolve(__dirname, '../example.json');

  // Example MCP client request for queryByJsonPath
  const request = {
    version: '0.1',
    tool_calls: [
      {
        name: 'queryByJsonPath',
        parameters: {
          path: '$.store.book[*].title',
          jsonFile: exampleJsonPath,
        },
      },
      {
        name: 'searchKeys',
        parameters: {
          query: 'author',
          jsonFile: exampleJsonPath,
          limit: 3,
        },
      },
      {
        name: 'searchValues',
        parameters: {
          query: 'Fitzgerald',
          jsonFile: exampleJsonPath,
          limit: 3,
        },
      },
    ],
  };

  try {
    const response = await fetch('http://localhost:3000/v1/tools', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('MCP Response:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error calling MCP server:', error);
  }
}

main().catch(console.error);

// Example output:
//
// MCP Response:
// {
//   "version": "0.1",
//   "results": [
//     [
//       {
//         "path": "$.store.book[0].title",
//         "value": "Moby Dick"
//       },
//       {
//         "path": "$.store.book[1].title",
//         "value": "The Great Gatsby"
//       },
//       {
//         "path": "$.store.book[2].title",
//         "value": "A Brief History of Time"
//       }
//     ],
//     [
//       {
//         "path": "$.store.book[0].author",
//         "similarity": 0.7272727272727273
//       },
//       {
//         "path": "$.store.book[1].author",
//         "similarity": 0.7272727272727273
//       },
//       {
//         "path": "$.store.book[2].author",
//         "similarity": 0.7272727272727273
//       }
//     ],
//     [
//       {
//         "path": "$.store.book[1].author",
//         "similarity": 0.5882352941176471,
//         "value": "F. Scott Fitzgerald"
//       }
//     ]
//   ]
// }
