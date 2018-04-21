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
    lastBlock: number;

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

    async getLastBlock(): Promise<number> {
        return parseInt(await this.storage.get("lastBlock") || "0");
    }
    async setLastBlock(block: number) {
         await this.storage.set("lastBlock", block);
    }

    async processQueryRequestEvent(event: QueryRequestEvent) {
        const { query } = JSON.parse(crypto.privateDecrypt(this.getSellerPrivateKey(), event.encryptedQuery).toString());

        const { requestId, buyerPublicKey } = event;
        console.log(`Received query request:`, requestId, query);

        await this.saveBuyerPublicKey(requestId, buyerPublicKey);
        console.log(`Saved buyer public key:`, requestId, buyerPublicKey);

        const metadata = this.searchAdapter.search(query);
        const { results, prices } = metadata;

        console.log(`Retrived query results:`, results, `with prices:`, prices, `for:`, event.requestId);
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

        const data = crypto.publicEncrypt(buyerPublicKey, new Buffer(JSON.stringify(document)));
        console.log(`Retrived data:`, data, `for:`, event.requestId);

        this.contractAdapter.dataResponse(requestId, data);
    }

    async listenToEvents() {
        const lastBlock = await this.getLastBlock();
        let newLastBlock = lastBlock;
        const queryRequestEvents = await this.contractAdapter.getEvents("LogQueryRequest", lastBlock + 1 );

        Promise.all(
            queryRequestEvents.map(async queryRequestEvent => {
                const { reqId, buyerPublicKey, encryptedQuery } = queryRequestEvent.returnValues;
                newLastBlock = Math.max(newLastBlock, queryRequestEvent.blockNumber);
                return await this.processQueryRequestEvent({
                    requestId: reqId,
                    buyerPublicKey,
                    encryptedQuery: new Buffer(encryptedQuery, "hex")
                });
            })
        );

        const dataRequestEvents = await this.contractAdapter.getEvents("LogDataRequest", lastBlock + 1 );

        Promise.all(
            dataRequestEvents.map(dataRequestEvent => {
                const { reqId, index} = dataRequestEvent.returnValues;
                newLastBlock = Math.max(newLastBlock, dataRequestEvent.blockNumber);
                return this.processDataRequestEvent({
                    requestId: reqId,
                    index
                });
            })
        );

        this.setLastBlock(newLastBlock);
    }
}
