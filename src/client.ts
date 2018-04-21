import * as crypto from "crypto";
import * as fs from "fs";
import { ContractAdapterInterface } from "./contract-adapter";
import { getPrivateKey, getPublicKey, queryToBuffer } from "./utils";
import { QueryResponseEvent } from "./interfaces";
import { SearchResult, SearchMetadata } from "./search-adapter";
const { NODE_ENV } = process.env;
const KEY_PATH = NODE_ENV === "test" ? `${__dirname}/../..` : `${__dirname}/../`;

export default class Client {
    adapter: ContractAdapterInterface;
    searchMetadata = new Map<string, SearchMetadata>();

    constructor(input: { adapter: ContractAdapterInterface }) {
        this.adapter = input.adapter;
    }

    async getSellerPublicKey(): Promise<crypto.RsaPublicKey> {
        return this.adapter.getSellerPublicKey();
    }

    getBuyerPrivateKey(): crypto.RsaPrivateKey {
        return getPrivateKey(`${KEY_PATH}/temp-keys/buyer/key`);
    }

    getBuyerPublicKey(): crypto.RsaPublicKey {
        return getPublicKey(`${KEY_PATH}/temp-keys/buyer/key.pub.pem`);
    }

    async queryRequest(query: string): Promise<string> {
        const queryAsBuffer = queryToBuffer(query);
        const encryptedQuery = crypto.publicEncrypt(await this.getSellerPublicKey(), queryAsBuffer);

        return this.adapter.queryRequest(encryptedQuery, this.getBuyerPublicKey());
    }

    processQueryResponseEvent(event: QueryResponseEvent) {
        const { results } = JSON.parse(crypto.privateDecrypt(this.getBuyerPrivateKey(), event.encryptedResponse).toString());
        this.storeSearchMetadata(event.requestId, { results, prices: event.prices });
    }

    storeSearchMetadata(requestId: string, metadata: SearchMetadata) {
        this.searchMetadata.set(requestId, metadata);
    }

    getSearchMetadata(requestId: string): SearchMetadata {
        return this.searchMetadata.get(requestId);
    }

    async listenToEvents() {
        const queryResponseEvents = await this.adapter.getEvents("LogQueryResponse", 0);

        queryResponseEvents.forEach((queryResponseEvent: any) => {
            const { reqId, dataPrices, encryptedQueryResults } = queryResponseEvent.returnValues;

            this.processQueryResponseEvent({
                requestId: reqId,
                prices: dataPrices,
                encryptedResponse: new Buffer(encryptedQueryResults, "hex")
            });
        });
    }

}
