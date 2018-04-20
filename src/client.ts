import * as crypto from "crypto";
import * as fs from "fs";
import { ContractAdapterInterface } from "./contract-adapter";
import { getPrivateKey, getPublicKey, queryToBuffer } from "./utils";
import { QueryResponseEvent } from "./interfaces";
import { SearchResult } from "./search-adapter";

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
        return getPrivateKey(`${__dirname}/../../temp-keys/buyer/key`);
    }

    getBuyerPublicKey(): crypto.RsaPublicKey {
        return getPublicKey(`${__dirname}/../../temp-keys/buyer/key.pub.pem`);
    }

    queryRequest(query: string) {
        const queryAsBuffer = queryToBuffer(query);
        const encryptedQuery = crypto.publicEncrypt(this.getSellerPublicKey(), queryAsBuffer);

        this.adapter.queryRequest(encryptedQuery, this.getBuyerPublicKey());
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
