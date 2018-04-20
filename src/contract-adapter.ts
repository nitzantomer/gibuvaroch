import * as fs from "fs";
import { RsaPublicKey } from "crypto";
const Web3 = require("web3");
import { getPublicKey } from "./utils";

export interface ContractAdapterInterface {
    queryRequest(query: Buffer, buyerPublicKey: RsaPublicKey): void;
    queryResponse(requestId: string, encryptedQueryResults: Buffer): void;
    getSellerPublicKey(): RsaPublicKey;
    test(): Promise<void>;
}
export default class ContractAdapter implements ContractAdapterInterface {
    address: string;
    web3: any;
    contract: any;

    constructor(input: { address: string }) {
        this.address = input.address;
        this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
        // FIXME: use real account
        // this.web3.eth.defaultAccount = this.web3.eth.accounts[0];

        const jsonInterface = JSON.parse(fs.readFileSync(`${__dirname}/../build/contracts/GibuvAroch.json`).toString()).abi;
        this.contract = new this.web3.eth.Contract(jsonInterface, this.address);
    }

    async test() {
        console.log(this.contract);
        console.log(await this.contract.methods.publicKey().call());
    }

    // TODO: replace with a real call
    getSellerPublicKey(): RsaPublicKey {
        return getPublicKey(`${__dirname}/../../temp-keys/seller/key.pub.pem`);
    }

    queryRequest(encryptedQuery: Buffer, buyerPublicKey: RsaPublicKey) {
        throw new Error(`Not implemented`);
    }

    queryResponse(requestId: string, encryptedQueryResults: Buffer) {
        throw new Error(`Not implemented`);
    }
}
