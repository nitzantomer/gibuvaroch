import * as crypto from "crypto";
import ContractAdapter from "./contract-adapter";

export default class Client {
    adapter: ContractAdapter;

    constructor(input: { adapter: ContractAdapter }) {
        this.adapter = input.adapter;
    }

    getSellerPublicKey(): Buffer {
        return new Buffer("seller-public-key");
    }

    getBuyerPrivateKey(): Buffer {
        return new Buffer("buyer-private-key");
    }

    getBuyerPublicKey(): Buffer {
        return new Buffer("buyer-public-key");
    }

    queryData(query: string) {
        const cipher = crypto.createCipher("aes192", this.getBuyerPrivateKey());
        const encryptedQuery = cipher.update(JSON.stringify({query}), "utf8");

        this.adapter.queryData(encryptedQuery, this.getBuyerPublicKey());
    }
}
