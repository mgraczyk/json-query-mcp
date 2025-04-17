import path from 'path';
import { JsonUtils } from './jsonUtils';

const exampleJsonPath = path.resolve(__dirname, '../example.json');

describe('JsonUtils', () => {
  describe('queryByJsonPath', () => {
    it('should return matching results for a valid path', async () => {
      const results = await JsonUtils.queryByJsonPath('$.store.book[*].title', exampleJsonPath);

      expect(results).toHaveLength(3);
      expect(results.map((r) => r.value)).toEqual([
        'Moby Dick',
        'The Great Gatsby',
        'A Brief History of Time',
      ]);
    });
  });

  describe('searchKeys', () => {
    it('should find keys similar to the query', async () => {
      const results = await JsonUtils.searchKeys('author', exampleJsonPath);

      expect(results.length).toBeGreaterThan(0);

      const authorMatch = results.find((r) => r.path.includes('author'));
      expect(authorMatch).toBeDefined();
      expect(authorMatch?.similarity).toBeGreaterThan(0.5);
    });
  });

  describe('searchValues', () => {
    it('should find values similar to the query', async () => {
      const results = await JsonUtils.searchValues('Fitzgerald', exampleJsonPath);

      expect(results.length).toBeGreaterThan(0);

      const fitzgeraldMatch = results.find(
        (r) => typeof r.value === 'string' && r.value.includes('Fitzgerald'),
      );
      expect(fitzgeraldMatch).toBeDefined();
      expect(fitzgeraldMatch?.similarity).toBeGreaterThan(0.5);
    });
  });
});
