import * as crypto from "crypto";
import * as fs from "fs";
import { SearchResult } from "./search-adapter";

export function getPublicKey(pathToKey: string): crypto.RsaPublicKey {
    return {
        key: fs.readFileSync(pathToKey).toString()
    };
}

export function getPrivateKey(pathToKey: string): crypto.RsaPrivateKey {
    return {
        key: fs.readFileSync(pathToKey).toString()
    };
}

export function queryToBuffer(query: string): Buffer {
    return new Buffer(JSON.stringify({ query }));
}

export function resultsToBuffer(results: SearchResult[]): Buffer {
    return new Buffer(JSON.stringify({ results }));
}
