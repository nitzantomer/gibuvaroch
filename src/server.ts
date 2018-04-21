import * as crypto from "crypto";
import { getPrivateKey, getPublicKey, resultsToBuffer } from "./utils";
import { QueryRequestEvent, DataRequestEvent } from "./interfaces";
import { ContractAdapterInterface } from "./contract-adapter";
import { SearchAdapterInterface, SearchMetadata } from "./search-adapter";
const redis = require("then-redis");

const { NODE_ENV } = process.env;
const KEY_PATH = NODE_ENV === "test" ? `${__dirname}/../..` : `${__dirname}/../`;

export default class Server {
    contractAdapter: ContractAdapterInterface;
    searchAdapter: SearchAdapterInterface;
    storage: any;

    constructor(input: { contractAdapter: ContractAdapterInterface, searchAdapter: SearchAdapterInterface }) {
        this.contractAdapter = input.contractAdapter;
        this.searchAdapter = input.searchAdapter;
        this.storage = redis.createClient();
    }

    getSellerPrivateKey(): crypto.RsaPrivateKey {
        return getPrivateKey(`${KEY_PATH}/temp-keys/seller/key`);
    }

    getSellerPublicKey(): crypto.RsaPublicKey {
        return getPublicKey(`${KEY_PATH}/temp-keys/seller/key.pub.pem`);
    }

    async saveBuyerPublicKey(requestId: string, buyerPublicKey: crypto.RsaPublicKey) {
        await this.storage.hset("publicKeys", requestId, buyerPublicKey);
    }

    async getBuyerPublicKey(requestId: string): Promise<crypto.RsaPublicKey> {
        const key = (await this.storage.hget("publicKeys", requestId));
        return { key };
    }

    async saveSearchMetadata(requestId: string, metadata: SearchMetadata) {
        return this.storage.hset("searchMetadata", requestId, JSON.stringify(metadata));
    }

    async getSearchMetadata(requestId: string): Promise<SearchMetadata> {
        const metadata = JSON.parse(await this.storage.hget("searchMetadata", requestId));
        return metadata;
    }

    async processQueryRequestEvent(event: QueryRequestEvent) {
        const { query } = JSON.parse(crypto.privateDecrypt(this.getSellerPrivateKey(), event.encryptedQuery).toString());

        const { requestId, buyerPublicKey } = event;
        console.log(`Received query request:`, requestId, query);

        await this.saveBuyerPublicKey(requestId, buyerPublicKey);
        console.log(`Saved buyer public key:`, requestId, buyerPublicKey);

        const metadata = this.searchAdapter.search(query);
        const { results, prices } = metadata;

        console.log(`Retrived query results:`, results, `with prices:`, prices);
        await this.saveSearchMetadata(requestId, metadata);

        const encryptedQueryResults = crypto.publicEncrypt(buyerPublicKey, resultsToBuffer(results));

        this.contractAdapter.queryResponse(requestId, prices, encryptedQueryResults);
    }

    async processDataRequestEvent(event: DataRequestEvent) {
        const { requestId, index } = event;
        const buyerPublicKey = await this.getBuyerPublicKey(requestId);
        const metadata = await this.getSearchMetadata(requestId);

        const documentId = metadata.results[index].id;
        const document = this.searchAdapter.getDocument(documentId);

        crypto.publicEncrypt(buyerPublicKey, new Buffer(JSON.stringify(document)));
    }

    async listenToEvents() {
        const queryRequestEvents = await this.contractAdapter.getEvents("LogQueryRequest", 0);

        queryRequestEvents.forEach(async (queryRequestEvent: any) => {
            const { reqId, buyerPublicKey, encryptedQuery} = queryRequestEvent.returnValues;

            await this.processQueryRequestEvent({
                requestId: reqId,
                buyerPublicKey,
                encryptedQuery: new Buffer(encryptedQuery, "hex")
            });
        });

        const dataRequestEvents = await this.contractAdapter.getEvents("LogDataRequest", 0);

        dataRequestEvents.forEach((dataRequestEvent: any) => {
            const { reqId, index} = dataRequestEvent.returnValues;

            this.processDataRequestEvent({
                requestId: reqId,
                index
            });
        });
    }
}
