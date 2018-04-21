declare const axios: any;
const CONTRACT_META = {
	address: "0x5e8657b1609a4d034405e37678e320c9c572a5d3",
	abi: [{"constant":false,"inputs":[{"name":"reqId","type":"bytes32"},{"name":"buyerPublicKey","type":"string"},{"name":"encryptedQuery","type":"string"}],"name":"queryRequest","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_newOwnerCandidate","type":"address"}],"name":"requestOwnershipTransfer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getPublicKey","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"reqId","type":"bytes32"},{"name":"dataPrices","type":"uint256[]"},{"name":"encryptedQueryResults","type":"string"}],"name":"queryResponse","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"publicKey","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"reqId","type":"bytes32"},{"name":"index","type":"uint256"}],"name":"dataRequest","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[],"name":"acceptOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"reqId","type":"bytes32"},{"name":"encryptedData","type":"string"}],"name":"dataResponse","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"newOwnerCandidate","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_publicKey","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"reqId","type":"bytes32"},{"indexed":false,"name":"buyerPublicKey","type":"string"},{"indexed":false,"name":"encryptedQuery","type":"string"}],"name":"LogQueryRequest","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"reqId","type":"bytes32"},{"indexed":false,"name":"dataPrices","type":"uint256[]"},{"indexed":false,"name":"encryptedQueryResults","type":"string"}],"name":"LogQueryResponse","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"reqId","type":"bytes32"},{"indexed":false,"name":"index","type":"uint256"}],"name":"LogDataRequest","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"reqId","type":"bytes32"},{"indexed":false,"name":"encryptedData","type":"string"}],"name":"LogDataResponse","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_by","type":"address"},{"indexed":true,"name":"_to","type":"address"}],"name":"OwnershipRequested","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"}],"name":"OwnershipTransferred","type":"event"}]
};

const proxy = {
	_base: "",
	_url(path: string) {
		let base = this._base;

		if (!base.endsWith("/")) {
			base += "/";
		}

		return base + (path.startsWith("/") ? path.substring(1) : path);
	},

	async init(ethereuNode: string, keyProvider: KeyProvider) {
		const keys = keyProvider();

		return await axios.put(this._url("session/create"), {
			contract_abi: CONTRACT_META.abi,
			contract_address: CONTRACT_META.address,
			encryption_keys: {
				"private": keys.encryptionPrivateKey,
				"public": keys.encryptionPublicKey
			},
			ethereum_private_key: keys.ethereumPrivateKey,
			node: ethereuNode
		});
	},

	async queryRequest(query: string) {
		const id = generateId();

		await axios.post(this._url(`${ id }/search`), { query });
		return id;
	},

	async queryResponse(id: string) {
		const response = await axios.get(this._url(`${ id }/search`));
		return response && response.data ? response.data : null;
	},

	async dataRequest(id: string, index: number, price: number) {
		await axios.post(this._url(`${ id }/data`), { index, price });
	},

	async dataResponse(id: string) {
		const response = await axios.get(this._url(`${ id }/data`));
		return response && response.data ? response.data : null;
	}
};

const CHARS = "0123456789abcdef";
function generateId(): string {
	let id = "";
	while (id.length < 64) {
		id += CHARS[Math.floor(Math.random() * Math.floor(CHARS.length))];
	}

	return "0x" + id;
}

export type KeyProvider = () => {
	encryptionPrivateKey: string;
	encryptionPublicKey: string;
	ethereumPrivateKey: string;
};

export type Client = {
	queryRequest(query: string): Promise<string>;
	queryResponse(id: string): Promise<{ prices: number[]; results: Array<{ id: string; description: string; score: number; }> }>;
	dataRequest(query: string, index: number, price: number): Promise<void>;
	dataResponse(id: string): Promise<{ id: string; contents: string; price: number; }>;
}

export async function init(proxyBase: string, ethereuNode: string, keyProvider: KeyProvider): Promise<Client> {
	proxy._base = proxyBase;
	await proxy.init(ethereuNode, keyProvider);
	return proxy;
}
