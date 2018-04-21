import * as fs from "fs";
import { RsaPublicKey } from "crypto";
const Web3 = require("web3");
import { getPublicKey } from "./utils";

export interface ContractAdapterInterface {
    queryRequest(query: Buffer, buyerPublicKey: RsaPublicKey): Promise<string>;
    queryResponse(requestId: string, prices: number[], encryptedQueryResults: Buffer): void;
    getSellerPublicKey(): Promise<RsaPublicKey>;
    getEvents(eventType: string, fromBlock: number): Promise<any>;
}
export default class ContractAdapter implements ContractAdapterInterface {
    address: string;
    web3: any;
    contract: any;
    account: any;

    constructor(input: { address: string, ethPrivateKey: string }) {
        this.address = input.address;
        this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

        const jsonInterface = JSON.parse(fs.readFileSync(`${__dirname}/../build/contracts/GibuvAroch.json`).toString()).abi;
        this.contract = new this.web3.eth.Contract(jsonInterface, this.address);

        this.account = this.web3.eth.accounts.privateKeyToAccount(input.ethPrivateKey);
    }

    async getSellerPublicKey(): Promise<RsaPublicKey> {
        const sellerPublicKey = await this.contract.methods.publicKey().call();

        console.log(`Retrieved seller public key`);
        console.log(sellerPublicKey);

        return { key: sellerPublicKey };
    }

    async queryRequest(encryptedQuery: Buffer, buyerPublicKey: RsaPublicKey): Promise<string> {
        const requestId = Web3.utils.randomHex(32);

        this.contract.methods.queryRequest(requestId, buyerPublicKey.key, encryptedQuery.toString("hex")).send({
            from: this.account.address,
            gas: 10000000000
        });

        return requestId;
    }

    async queryResponse(requestId: string, prices: number[], encryptedQueryResults: Buffer) {
        this.contract.methods.queryResponse(requestId, prices, encryptedQueryResults.toString("hex")).send({
            from: this.account.address,
            gas: 10000000000
        });
    }

    async getEvents(eventType: string, fromBlock: number): Promise<any> {
        return this.contract.getPastEvents(eventType, { fromBlock, toBlock: "latest" });
    }
}
