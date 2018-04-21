import * as crypto from "crypto";

export interface QueryRequestEvent {
    requestId: string;
    encryptedQuery: Buffer;
    buyerPublicKey: crypto.RsaPublicKey;
}

export interface QueryResponseEvent {
    requestId: string;
    prices: number[];
    encryptedResponse: Buffer;
}

export interface DataRequestEvent {
    requestId: string;
    index: number;
}

export interface DataResponseEvent {
    requestId: string;
    encryptedData: Buffer;
}
