import * as crypto from "crypto";
import * as fs from "fs";
import { ContractAdapterInterface } from "./contract-adapter";
import { getPrivateKey, getPublicKey, queryToBuffer } from "./utils";
import { QueryResponseEvent } from "./interfaces";
import { SearchResult } from "./search-adapter";
const { NODE_ENV } = process.env;
const KEY_PATH = NODE_ENV === "test" ? `${__dirname}/../..` : `${__dirname}/../`;

export default class Client {
    adapter: ContractAdapterInterface;
    requestResults = new Map<String, SearchResult[]>();

    constructor(input: { adapter: ContractAdapterInterface }) {
        this.adapter = input.adapter;
    }

    getSellerPublicKey(): crypto.RsaPublicKey {
        return this.adapter.getSellerPublicKey();
    }

    getBuyerPrivateKey(): crypto.RsaPrivateKey {
        return getPrivateKey(`${KEY_PATH}/temp-keys/buyer/key`);
    }

    getBuyerPublicKey(): crypto.RsaPublicKey {
        return getPublicKey(`${KEY_PATH}/temp-keys/buyer/key.pub.pem`);
    }

    async queryRequest(query: string): Promise<String> {
        const queryAsBuffer = queryToBuffer(query);
        const encryptedQuery = crypto.publicEncrypt(this.getSellerPublicKey(), queryAsBuffer);

        return this.adapter.queryRequest(encryptedQuery, this.getBuyerPublicKey());
    }

    processQueryResponseEvent(event: QueryResponseEvent) {
        const { results } = JSON.parse(crypto.privateDecrypt(this.getBuyerPrivateKey(), event.encryptedResponse).toString());
        this.storeRequestResults(event.requestId, results);
    }

    storeRequestResults(requestId: string, results: SearchResult[]) {
        this.requestResults.set(requestId, results);
    }

    getRequestResults(requestId: string): SearchResult[] {
        return this.requestResults.get(requestId);
    }
}
