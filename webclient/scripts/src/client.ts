const CONTRACT_META = {
	address: "0x363d6d467227D0ed02986a21C6DA677e15f90A01",
	abi: [{"constant":false,"inputs":[{"name":"reqId","type":"bytes32"},{"name":"buyerPublicKey","type":"string"},{"name":"encryptedQuery","type":"string"}],"name":"queryRequest","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_newOwnerCandidate","type":"address"}],"name":"requestOwnershipTransfer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getPublicKey","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"reqId","type":"bytes32"},{"name":"dataPrices","type":"uint256[]"},{"name":"encryptedQueryResults","type":"string"}],"name":"queryResponse","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"publicKey","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"reqId","type":"bytes32"},{"name":"index","type":"uint256"}],"name":"dataRequest","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[],"name":"acceptOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"reqId","type":"bytes32"},{"name":"encryptedData","type":"string"}],"name":"dataResponse","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"newOwnerCandidate","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_publicKey","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"reqId","type":"bytes32"},{"indexed":false,"name":"buyerPublicKey","type":"string"},{"indexed":false,"name":"encryptedQuery","type":"string"}],"name":"LogQueryRequest","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"reqId","type":"bytes32"},{"indexed":false,"name":"dataPrices","type":"uint256[]"},{"indexed":false,"name":"encryptedQueryResults","type":"string"}],"name":"LogQueryResponse","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"reqId","type":"bytes32"},{"indexed":false,"name":"index","type":"uint256"}],"name":"LogDataRequest","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"reqId","type":"bytes32"},{"indexed":false,"name":"encryptedData","type":"string"}],"name":"LogDataResponse","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_by","type":"address"},{"indexed":true,"name":"_to","type":"address"}],"name":"OwnershipRequested","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"}],"name":"OwnershipTransferred","type":"event"}]
};

let web3: any;
let contract: any;
let clientAccount: any;

export type KeyProvider = () => { privateKey: string, publicKey: string };

export async function init(ethereumHost: string, keyProvider: KeyProvider) {
	web3 = new Web3(new Web3.providers.HttpProvider(ethereumHost));
	console.log(web3.version);
	//console.log(web3.eth.accounts);
	//web3.net.getListening((error, result) => { console.log("HERE: ", result, error, web3.eth.accounts) })
	// console.log(web3.eth.getBlockNumber());


	const Contract = web3.eth.contract(CONTRACT_META.abi);
	contract = Contract.at(CONTRACT_META.address);

	console.log(web3.eth.accounts);
	clientAccount = web3.eth.accounts.privateKeyToAccount(keyProvider());
}
