import * as crypto from "crypto";
import { ContractAdapterInterface } from "./contract-adapter";
import { getPrivateKey, getPublicKey, queryToBuffer } from "./utils";
import { QueryResponseEvent, DataResponseEvent } from "./interfaces";
import { SearchMetadata, SearchDocument } from "./search-adapter";
const { NODE_ENV } = process.env;
const KEY_PATH = NODE_ENV === "test" ? `${__dirname}/../..` : `${__dirname}/../`;

export default class Client {
    adapter: ContractAdapterInterface;
    searchMetadata = new Map<string, SearchMetadata>();
    documents = new Map<string, SearchDocument>();

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

    processDataResponseEvent(event: DataResponseEvent) {
        const { requestId, encryptedData } = event;
        const document: SearchDocument = JSON.parse(crypto.privateDecrypt(this.getBuyerPrivateKey(), encryptedData).toString());

        this.storeSearchDocument(requestId, document);
    }

    storeSearchMetadata(requestId: string, metadata: SearchMetadata) {
        this.searchMetadata.set(requestId, metadata);
    }

    getSearchMetadata(requestId: string): SearchMetadata {
        return this.searchMetadata.get(requestId);
    }

    storeSearchDocument(requestId: string, document: SearchDocument) {
        this.documents.set(requestId, document);
    }

    getSearchDocument(requestId: string): SearchDocument {
        return this.documents.get(requestId);
    }

    async listenToEvents() {
        const queryResponseEvents = await this.adapter.getEvents("LogQueryResponse", 0);
        await Promise.all(
            queryResponseEvents.map(queryResponseEvent => {
                const { reqId, dataPrices, encryptedQueryResults } = queryResponseEvent.returnValues;
                return this.processQueryResponseEvent({
                    requestId: reqId,
                    prices: dataPrices,
                    encryptedResponse: new Buffer(encryptedQueryResults, "hex")
                });
            })
        );

        const dataResponseEvents = await this.adapter.getEvents("LogDataResponse", 0);
        await Promise.all(
            dataResponseEvents.map(dataResponseEvent => {
                const { reqId, encryptedData } = dataResponseEvent.returnValues;

                return this.processDataResponseEvent({
                    requestId: reqId,
                    encryptedData: new Buffer(encryptedData, "hex")
                });
            })
        );
    }

    dataRequest(requestId: string, index: number) {
        const price = this.getSearchMetadata(requestId).prices[index];
        this.adapter.dataRequest(requestId, index, price);
    }
}
