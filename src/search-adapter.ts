import * as _ from "lodash";
import * as fs from "fs";
import * as crypto from "crypto";

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

const privateStorageKey = _.trim(fs.readFileSync(`${__dirname}/../storage-keys/key`).toString());
const privateStorageKeyIv = _.trim(fs.readFileSync(`${__dirname}/../storage-keys/iv`).toString());

const ENCRYPTED_DOCUMENT_PATH = `${__dirname}/../encrypted-documents`;

function decryptDocument(name: string) {
    const encryptedContent = fs.readFileSync(`${ENCRYPTED_DOCUMENT_PATH}/${name}`);
    const decipher = crypto.createDecipheriv("aes192", privateStorageKey, privateStorageKeyIv);
    const decryptedContents = Buffer.concat([decipher.update(encryptedContent), decipher.final()]).toString("utf-8");
    return decryptedContents;
}

function getDecryptedDocuments(): SearchDocument[] {
    return fs.readdirSync(ENCRYPTED_DOCUMENT_PATH).map((documentName: string, idx: number) => {
        return {
            id: documentName,
            contents: decryptDocument(documentName),
            price: (idx + 1) * 10
        };
    });
}

export default class SearchAdapter implements SearchAdapterInterface {
    getDocument(id: string): SearchDocument {
        return _.find(getDecryptedDocuments(), { id });
    }

    search(query: string): SearchMetadata {
        const results: SearchResult[] = [];
        const prices: number[] = [];

        for (const document of getDecryptedDocuments()) {
            let score = 0;

            const matches: string[] = [];

            for (const term of query.split(/\W/)) {
                if (term.length <= 3) {
                    continue;
                }

                document.contents.split("\n").forEach(line => {
                    if (_.includes(line.toLowerCase(), term.toLowerCase())) {
                        score += 1;
                        matches.push(line);
                    }
                });
            }

            if (score > 0) {
                results.push({
                    id: document.id,
                    description: matches[0].slice(0, 60) + "...",
                    score
                });

                prices.push(document.price);
            }
        }

        return { results, prices };
    }
}
