import fs from 'fs/promises';
import { JSONPath } from 'jsonpath-plus';
import stringSimilarity from 'string-similarity';
import { JsonPathResult, SearchResult } from './types.js';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class JsonUtils {
  private static async readJsonFile(filePath: string): Promise<unknown> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to read or parse JSON file: ${error}`);
      } else {
        throw new Error('Failed to read or parse JSON file');
      }
    }
  }

  static async queryByJsonPath(path: string, jsonFile: string): Promise<JsonPathResult[]> {
    const data = await this.readJsonFile(jsonFile);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const results = JSONPath({
      path,
      json: data as object,
      resultType: 'all',
    }) as { path: string; value: unknown }[];

    return results.map((result) => ({
      path: result.path,
      value: result.value,
    }));
  }

  static async searchKeys(query: string, jsonFile: string, limit = 5): Promise<SearchResult[]> {
    const data = await this.readJsonFile(jsonFile);
    const keyPaths: { path: string; key: string }[] = [];

    const collectKeys = (obj: unknown, path = '$'): void => {
      if (obj && typeof obj === 'object') {
        if (Array.isArray(obj)) {
          obj.forEach((item, index) => {
            collectKeys(item, `${path}[${index.toString()}]`);
          });
        } else {
          Object.entries(obj).forEach(([key, value]) => {
            const newPath = path === '$' ? `$.${key}` : `${path}.${key}`;
            keyPaths.push({ path: newPath, key });
            collectKeys(value, newPath);
          });
        }
      }
    };

    collectKeys(data);

    const matches = keyPaths.map((item) => ({
      path: item.path,
      similarity: stringSimilarity.compareTwoStrings(query.toLowerCase(), item.key.toLowerCase()),
    }));

    return matches.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
  }

  static async searchValues(query: string, jsonFile: string, limit = 5): Promise<SearchResult[]> {
    const data = await this.readJsonFile(jsonFile);
    const valuePaths: { path: string; value: unknown }[] = [];

    const collectValues = (obj: unknown, path = '$'): void => {
      if (obj && typeof obj === 'object') {
        if (Array.isArray(obj)) {
          obj.forEach((item, index) => {
            const newPath = `${path}[${index.toString()}]`;
            if (typeof item === 'string' || typeof item === 'number') {
              valuePaths.push({ path: newPath, value: item });
            }
            collectValues(item, newPath);
          });
        } else {
          Object.entries(obj).forEach(([key, value]) => {
            const newPath = path === '$' ? `$.${key}` : `${path}.${key}`;
            if (typeof value === 'string' || typeof value === 'number') {
              valuePaths.push({ path: newPath, value });
            }
            collectValues(value, newPath);
          });
        }
      }
    };

    collectValues(data);

    const stringQuery = String(query).toLowerCase();
    const matches = valuePaths
      .filter((item) => typeof item.value === 'string' || typeof item.value === 'number')
      .map((item) => ({
        path: item.path,
        similarity: stringSimilarity.compareTwoStrings(
          stringQuery,
          String(item.value).toLowerCase(),
        ),
        value: item.value,
      }));

    return matches.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
  }
}
