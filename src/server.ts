import * as crypto from "crypto";
import { getPrivateKey, getPublicKey, resultsToBuffer } from "./utils";
import { QueryRequestEvent } from "./interfaces";
import { ContractAdapterInterface } from "./contract-adapter";
import { SearchAdapterInterface } from "./search-adapter";

const { NODE_ENV } = process.env;
const KEY_PATH = NODE_ENV === "test" ? `${__dirname}/../..` : `${__dirname}/../`;

export default class Server {
    contractAdapter: ContractAdapterInterface;
    searchAdapter: SearchAdapterInterface;

    constructor(input: { contractAdapter: ContractAdapterInterface, searchAdapter: SearchAdapterInterface }) {
        this.contractAdapter = input.contractAdapter;
        this.searchAdapter = input.searchAdapter;
    }

    getSellerPrivateKey(): crypto.RsaPrivateKey {
        return getPrivateKey(`${KEY_PATH}/temp-keys/seller/key`);
    }

    getSellerPublicKey(): crypto.RsaPublicKey {
        return getPublicKey(`${KEY_PATH}/temp-keys/seller/key.pub.pem`);
    }

    processQueryRequestEvent(event: QueryRequestEvent) {
        const { query } = JSON.parse(crypto.privateDecrypt(this.getSellerPrivateKey(), event.encryptedQuery).toString());

        console.log(`Received query request:`, query);

        const searchResults = this.searchAdapter.search(query);
        const encryptedQueryResults = crypto.publicEncrypt(event.buyerPublicKey, resultsToBuffer(searchResults));

        this.contractAdapter.queryResponse(event.requestId, encryptedQueryResults);
    }

    async listenToEvents() {
        const queryRequestEvents = await this.contractAdapter.getQueryRequestEvents(0);

        queryRequestEvents.forEach((queryRequestEvent: any) => {
            console.log(queryRequestEvent);

            const { reqId, buyerPublicKey, encryptedQuery} = queryRequestEvent.returnValues;

            this.processQueryRequestEvent({
                requestId: reqId,
                buyerPublicKey,
                encryptedQuery: new Buffer(encryptedQuery, "hex")
            });
        });
    }
}
