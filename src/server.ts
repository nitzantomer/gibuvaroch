import * as crypto from "crypto";
import { getPrivateKey, getPublicKey, resultsToBuffer } from "./utils";
import { QueryRequestEvent } from "./interfaces";
import { ContractAdapterInterface } from "./contract-adapter";
import { SearchAdapterInterface } from "./search-adapter";

export default class Server {
    contractAdapter: ContractAdapterInterface;
    searchAdapter: SearchAdapterInterface;

    constructor(input: { contractAdapter: ContractAdapterInterface, searchAdapter: SearchAdapterInterface }) {
        this.contractAdapter = input.contractAdapter;
        this.searchAdapter = input.searchAdapter;
    }

    getSellerPrivateKey(): crypto.RsaPrivateKey {
        return getPrivateKey(`${__dirname}/../../temp-keys/seller/key`);
    }

    getSellerPublicKey(): crypto.RsaPublicKey {
        return getPublicKey(`${__dirname}/../../temp-keys/seller/key.pub.pem`);
    }

    processQueryRequestEvent(event: QueryRequestEvent) {
        const { query } = JSON.parse(crypto.privateDecrypt(this.getSellerPrivateKey(), event.encryptedQuery).toString());

        const searchResults = this.searchAdapter.search(query);
        const encryptedQueryResults = crypto.publicEncrypt(event.buyerPublicKey, resultsToBuffer(searchResults));

        this.contractAdapter.queryResponse(encryptedQueryResults);
    }
}
