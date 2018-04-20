import * as crypto from "crypto";
import * as fs from "fs";
import { ContractAdapterInterface } from "./contract-adapter";
import { getPrivateKey, getPublicKey, queryToBuffer } from "./utils";

export default class Client {
    adapter: ContractAdapterInterface;

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

    queryData(query: string) {
        const queryAsBuffer = queryToBuffer(query);
        const encryptedQuery = crypto.publicEncrypt(this.getSellerPublicKey(), queryAsBuffer);

        this.adapter.queryData(encryptedQuery, this.getBuyerPublicKey());
    }
}
