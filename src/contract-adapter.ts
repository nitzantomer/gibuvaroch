import * as fs from "fs";
import { RsaPublicKey } from "crypto";
const Web3 = require("web3");

export interface ContractAdapterInterface {
    queryRequest(query: Buffer, buyerPublicKey: RsaPublicKey): Promise<string>;
    queryResponse(requestId: string, prices: number[], encryptedQueryResults: Buffer): void;
    getSellerPublicKey(): Promise<RsaPublicKey>;
    getEvents(eventType: string, fromBlock: number): Promise<ContractEvent[]>;
    dataRequest(requestId: string, index: number, price: number): void;
    dataResponse(requestId: string, encryptedData: Buffer): void;
}

export interface ContractEvent {
    returnValues: any;
    raw: {
        data: string;
        topics: string[];
    };
    event: string;
    signature: string;
    logIndex: number;
    transactionIndex: number;
    transactionHash: string;
    blockHash: string;
    blockNumber: number;
    address: string;
}

export default class ContractAdapter implements ContractAdapterInterface {
    address: string;
    web3: any;
    contract: any;
    account: any;

    constructor(input: { network: string, address: string, ethPrivateKey: string }) {
        this.address = input.address;
		this.web3 = new Web3(new Web3.providers.HttpProvider(input.network));

        const jsonInterface = JSON.parse(fs.readFileSync(`${__dirname}/../build/contracts/GibuvAroch.json`).toString()).abi;
        this.contract = new this.web3.eth.Contract(jsonInterface, this.address);

        this.account = this.web3.eth.accounts.privateKeyToAccount(input.ethPrivateKey);
    }

    async getSellerPublicKey(): Promise<RsaPublicKey> {
		function parseKey(input: string): string {
			return input
				.replace(/ RSA PUBLIC KEY/g, "-RSA-PUBLIC-KEY")
				.replace(/ /g, "\n")
				.replace(/-RSA-PUBLIC-KEY/g, " RSA PUBLIC KEY");
		}
		console.log(await this.contract.methods.getPublicKey());

		const sellerPublicKey = parseKey(await this.contract.methods.getPublicKey().call())

        console.log(`Retrieved seller public key`);
        console.log(sellerPublicKey);

        return { key: sellerPublicKey };
    }

    async queryRequest(encryptedQuery: Buffer, buyerPublicKey: RsaPublicKey): Promise<string> {
        const requestId = Web3.utils.randomHex(32);

        await this.contract.methods.queryRequest(requestId, buyerPublicKey.key, encryptedQuery.toString("hex")).send({
            from: this.account.address,
            gas: 10000000000
        });

        return requestId;
    }

    async queryResponse(requestId: string, prices: number[], encryptedQueryResults: Buffer) {
        await this.contract.methods.queryResponse(requestId, prices, encryptedQueryResults.toString("hex")).send({
            from: this.account.address,
            gas: 10000000000
        });
    }

    async getEvents(eventType: string, fromBlock: number): Promise<ContractEvent[]> {
        return this.contract.getPastEvents(eventType, { fromBlock, toBlock: "latest" });
    }

    dataRequest(requestId: string, index: number, price: number): void {
        return this.contract.methods.dataRequest(requestId, index).send({
            from: this.account.address,
            value: price
        });
    }

    dataResponse(requestId: string, encryptedData: Buffer): void {
        return this.contract.methods.dataResponse(requestId, encryptedData.toString("hex")).send({
            from: this.account.address,
            gas: 10000000000
        });
    }
}
