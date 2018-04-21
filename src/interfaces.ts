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
