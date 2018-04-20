import * as fs from "fs";
import { RsaPublicKey } from "crypto";

export interface ContractAdapterInterface {
    queryData(query: Buffer, buyerPublicKey: RsaPublicKey): void;
    getSellerPublicKey(): RsaPublicKey;
}
export default class ContractAdapter implements ContractAdapterInterface {
    address: string;

    constructor(input: { address: string }) {
        this.address = input.address;
    }

    // TODO: replace with a real call
    getSellerPublicKey(): RsaPublicKey {
        throw new Error(`Not implemented`);
    }

    queryData(encryptedQuery: Buffer, buyerPublicKey: RsaPublicKey) {
        throw new Error(`Not implemented`);
    }
}
