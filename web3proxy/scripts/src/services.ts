const Web3 = require("web3");
import * as crypto from "crypto";
import { Express, Request as ExpressRequest, Response as ExpressResponse } from "express";

let web3: any;
let account: any;
let contract: any;
let keyPair: KeyPair;
let contractAddress: string;

type Request = ExpressRequest & {
	params: {
		req_id: string;
	}
};

type KeyPair = {
	"public": string;
	"private": string;
};

type CreateSessionRequest = ExpressRequest & {
	body: {
		contract_abi: any;
		contract_address: string;

		encryption_keys: KeyPair;
		ethereum_private_key: string;
	}
};
async function createSession(req: CreateSessionRequest, res: ExpressResponse) {
	keyPair = req.body.encryption_keys;
	web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

	const abi = typeof req.body.contract_abi === "string" ? JSON.parse(req.body.contract_abi) : req.body.contract_abi;
	contract = new web3.eth.Contract(abi, req.body.contract_address);
	contractAddress = await contract.methods.publicKey().call();
	account = web3.eth.accounts.privateKeyToAccount(req.body.ethereum_private_key);
	console.log(`account address ${ account.address } for key ${ req.body.ethereum_private_key }`);
	res.status(200).send();
}

type PostSearchRequest = Request & {
	body: {
		query: string;
	}
};
function postSearch(req: PostSearchRequest, res: ExpressResponse) {
	const queryAsBuffer = new Buffer(JSON.stringify({ query: req.body.query }));
	const encryptedQuery = crypto.publicEncrypt(contractAddress, queryAsBuffer);

	contract.methods.queryRequest(req.params.req_id, keyPair.public, encryptedQuery.toString("hex")).send({
		from: account.address,
		gas: 10000000000
	});

	res.status(200).send();
}

async function getSearchResult(req: Request, res: ExpressResponse) {
	const events = await contract.getPastEvents("LogQueryResponse", { fromBlock: 0, toBlock: "latest" });
	const match = !events ? null : events
		.reduce((previous, current) => {
			if (previous) {
				return previous;
			}

			const { reqId, dataPrices, encryptedQueryResults } = current.returnValues;
			if (reqId !== req.params.req_id) {
				return null;
			}

			const { results } = JSON.parse(crypto.privateDecrypt(keyPair.private, new Buffer(encryptedQueryResults, "hex")).toString());
			return { results, prices: dataPrices };
		}, null);

	res.status(200).send(match);
}

type PostDataRequest = Request & {
	body: {
		index: number;
		price: number;
	}
};
async function postData(req: PostDataRequest, res: ExpressResponse) {
	try {
		await contract.methods.dataRequest(req.params.req_id, req.body.index).send({
			from: account.address,
			value: req.body.price
		});

		res.status(200).send();
	} catch (e) {
		res.status(400).send();
	}
}

async function getDataResult(req: Request, res: ExpressResponse) {
	const events = await contract.getPastEvents("LogDataResponse", { fromBlock: 0, toBlock: "latest" });
	const match = !events ? null : events
		.reduce((previous, current) => {
			if (previous) {
				return previous;
			}

			const { reqId, encryptedData } = current.returnValues;
			if (reqId !== req.params.req_id) {
				return null;
			}

			return JSON.parse(crypto.privateDecrypt(keyPair.private, new Buffer(encryptedData, "hex")).toString());
		}, null);

	res.status(200).send(match);
}

export function init(app: Express) {
	app.put("/session/create", createSession);

	app.post("/:req_id/search", postSearch);
	app.get("/:req_id/search", getSearchResult);

	app.post("/:req_id/data", postData);
	app.get("/:req_id/data", getDataResult);
}