import * as _ from "lodash";

export interface SearchResult {
    id: string;
    description: string;
    score: number;
}

export interface SearchMetadata {
    results: SearchResult[];
    prices: number[];
}

export interface SearchAdapterInterface {
    search(query: string): SearchMetadata;
    getDocument(id: string): SearchDocument;
}

export interface SearchDocument {
    id: string;
    contents: string;
    price: number;
}

export default class SearchAdapter implements SearchAdapterInterface {
    documents: SearchDocument[] = [
        {
            id: "hello",
            contents: "some lame stuff",
            price: 10
        },
        {
            id: "some-file.pdf",
            contents: "maybe query results",
            price: 20
        },
        {
            id: "very important stuff.csv",
            contents: "this query has some good qualities",
            price: 30
        }
    ];

    getDocument(id: string): SearchDocument {
        return _.find(this.documents, { id });
    }

    search(query: string): SearchMetadata {
        const results: SearchResult[] = [];
        const prices: number[] = [];

        for (const document of this.documents) {
            let score = 0;

            for (const term of query.split(/\W/)) {
                if (_.includes(document.contents, term)) {
                    score += 1;
                }
            }

            if (score > 0) {
                results.push({
                    id: document.id,
                    description: document.contents.slice(0, 10),
                    score
                });

                prices.push(document.price);
            }
        }

        return { results, prices };
    }
}
