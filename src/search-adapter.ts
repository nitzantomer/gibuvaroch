import * as _ from "lodash";

export interface SearchResult {
    id: number;
    description: string;
    score: number;
}

export interface SearchAdapterInterface {
    search(query: string): SearchResult[];
}

export default class SearchAdapter implements SearchAdapterInterface {
    private lookup(document: string, term: string) {
        return ;
    }

    search(query: string): SearchResult[] {
        const documents = [
            "some lame stuff",
            "maybe query results",
            "this query has some good qualities"
        ];

        const results: SearchResult[] = [];

        for (const document of documents) {
            let score = 0;

            for (const term of query.split(/\W/)) {
                if (_.includes(document, term)) {
                    score += 1;
                }
            }

            if (score > 0) {
                results.push({
                    id: 0,
                    description: document.slice(0, 10),
                    score
                });
            }
        }

        return results;
    }
}
