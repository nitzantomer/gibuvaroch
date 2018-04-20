import * as crypto from "crypto";

export interface QueryRequestEvent {
    encryptedQuery: Buffer;
    buyerPublicKey: crypto.RsaPublicKey;
}

export interface QueryResponseEvent {
    encryptedResponse: Buffer;
}
