export interface SearchResult {
    id: number;
    description: string;
    score: number;
}

export interface SearchAdapterInterface {
    search(query: string): SearchResult[];
}
