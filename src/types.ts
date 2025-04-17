export interface JsonPathResult {
  path: string;
  value: unknown;
}

export interface SearchResult {
  path: string;
  similarity: number;
  value?: unknown;
}
