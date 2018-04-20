import * as fs from "fs";
import { RsaPublicKey } from "crypto";

export interface ContractAdapterInterface {
    queryRequest(query: Buffer, buyerPublicKey: RsaPublicKey): void;
    queryResponse(requestId: string, encryptedQueryResults: Buffer): void;
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

    queryRequest(encryptedQuery: Buffer, buyerPublicKey: RsaPublicKey) {
        throw new Error(`Not implemented`);
    }

    queryResponse(requestId: string, encryptedQueryResults: Buffer) {
        throw new Error(`Not implemented`);
    }
}
