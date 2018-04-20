export interface ContractAdapterInterface {
    queryData(query: Buffer, buyerPublicKey: Buffer): void;
}

export default class ContractAdapter implements ContractAdapterInterface {
    address: string;

    constructor(input: { address: string }) {
        this.address = input.address;
    }

    queryData(encryptedQuery: Buffer, buyerPublicKey: Buffer) {
        throw new Error(`Not implemented`);
    }
}
