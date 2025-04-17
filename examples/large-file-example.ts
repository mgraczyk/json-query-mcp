import fs from 'fs';
import path from 'path';

// This example demonstrates creating and querying a larger JSON file

async function generateLargeJson(
  filePath: string,
  itemCount = 1000,
): Promise<void> {
  const data = {
    items: Array.from({ length: itemCount }, (_, i) => ({
      id: `item-${i}`,
      name: `Product ${i}`,
      description: `This is a description for product ${i}`,
      price: Math.round(Math.random() * 10000) / 100,
      categories: [
        `category-${Math.floor(Math.random() * 10)}`,
        `category-${Math.floor(Math.random() * 10)}`,
      ],
      metadata: {
        created: new Date().toISOString(),
        status: ['active', 'inactive', 'archived'][
          Math.floor(Math.random() * 3)
        ],
        tags: Array.from(
          { length: Math.floor(Math.random() * 5) + 1 },
          () => `tag-${Math.floor(Math.random() * 20)}`,
        ),
      },
    })),
    stats: {
      totalCount: itemCount,
      activeTags: Array.from({ length: 20 }, (_, i) => `tag-${i}`),
      priceRanges: {
        budget: { min: 0, max: 49.99 },
        standard: { min: 50, max: 99.99 },
        premium: { min: 100, max: Infinity },
      },
    },
  };

  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
  console.log(`Generated large JSON file (${itemCount} items) at: ${filePath}`);
}

async function queryMcpServer(jsonFilePath: string): Promise<void> {
  const queryExamples = [
    {
      type: 'queryByJsonPath',
      title: 'Get products with price > 90',
      parameters: {
        path: '$.items[?(@.price > 90)]',
        jsonFile: jsonFilePath,
      },
    },
    {
      type: 'queryByJsonPath',
      title: 'Get all active products',
      parameters: {
        path: '$.items[?(@.metadata.status == "active")]',
        jsonFile: jsonFilePath,
      },
    },
    {
      type: 'searchKeys',
      title: 'Search for keys related to "tag"',
      parameters: {
        query: 'tag',
        jsonFile: jsonFilePath,
        limit: 3,
      },
    },
    {
      type: 'searchValues',
      title: 'Search for values containing "Product 5"',
      parameters: {
        query: 'Product 5',
        jsonFile: jsonFilePath,
        limit: 3,
      },
    },
  ];

  for (const example of queryExamples) {
    console.log(`\nRunning: ${example.title}`);

    try {
      const response = await fetch('http://localhost:3000/v1/tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: '0.1',
          tool_calls: [
            {
              name: example.type,
              parameters: example.parameters,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Result:');

      // Format the output to avoid overwhelming console
      if (example.type === 'queryByJsonPath') {
        console.log(`Found ${data.results[0].length} matches`);
        console.log('First 3 matches:');
        console.log(JSON.stringify(data.results[0].slice(0, 3), null, 2));
      } else {
        console.log(JSON.stringify(data.results[0], null, 2));
      }
    } catch (error) {
      console.error(`Error executing ${example.title}:`, error);
    }
  }
}

async function main(): Promise<void> {
  const largeJsonPath = path.resolve(__dirname, '../large-example.json');

  // Generate a large JSON file for testing
  await generateLargeJson(largeJsonPath, 1000);

  // Run various queries against the large file
  await queryMcpServer(largeJsonPath);
}

main().catch(console.error);
