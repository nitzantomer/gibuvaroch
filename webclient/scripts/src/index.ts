import { init as initView, SearchResult } from "./view";
import { init as initClient, Client } from "./client";

const ENCRYPTION_PRIVATE_KEY = "-----BEGIN RSA PRIVATE KEY-----\n" +
	"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\n" +
	"-----END RSA PRIVATE KEY-----";

const ENCRYPTION_PUBLIC_KEY = "-----BEGIN RSA PUBLIC KEY-----\n" +
	"MIICCgKCAgEAr4NNJBoosVehYFwEzia84jzQKLjXrcBD8wMTRuxVFPCr6n6EIQNw\n" +
	"Uw5AUQkkPMRIMj8meTlW5Obk654neSK6PIbrdUJApImL1TfGEAPwxXCd+aTX4JyJ\n" +
	"bPtAn9c34WiCvDapNhPxD5fLQC8Gj0Q3xuLUfz59FyXGWH7sv/AV5XHv0uPcIN3K\n" +
	"0a23aBzgmGiPy6czkVxlKqSYlUQ0GuwV2seEN7O+xXuneZfwG+P6He9N5Yt0iRBJ\n" +
	"gLyqNJaGL3ZXvSXINLi0+515aXGQn7FQiSQrImqn/+v/r5n2UgZxOPcwsYV9lBJj\n" +
	"mt1C0efSQV24v5VfRemK+p38ODjj3zFYKXLz1RbP7Mld7uV/lLHA/xdZJI0itF5J\n" +
	"ly4wNwqd9Fc/3wP/P7KIUu1fcIoF4CTR4MDBvQTsNuRtG2Xq4PGGlymGmih3eono\n" +
	"1goFI6qyDBEJ9eU5dk5pHrjdi9H1d0A7wEYiI/eq6kkWM8KaUokH1k7SyR21IGbX\n" +
	"ir+Oqte6/lY/v8yh5XJceBgTDjBdBIx+hYzQhIU+PKp9yoY+KUrr6YwKvq+8LIZk\n" +
	"SgDd+kovYsgVK+wKvbZAlfz60sJcYXrF3mI3rIHw0KLkJylB9B9G9EV3KGp4UJwg\n" +
	"dR0Jl6SJZPWqLbgg0cP+9Z9o54mJH4b1Kl+0hCRMpK3iE4SGqjomZwkCAwEAAQ==\n" +
	"-----END RSA PUBLIC KEY-----";

let client: Client;
let currentSearchId: string;
let currentSearchResults = new Map<string, SearchResult & { index: number; }>();
async function search(query: string): Promise<SearchResult[]> {
	currentSearchResults.clear();
	currentSearchId = await client.queryRequest(query);

	let counter = 10;
	while (counter > 0) {
		const response = await client.queryResponse(currentSearchId);
		if (response && response.results.length === response.prices.length) {
			return response.results.map((result, index) => {
				const item = Object.assign({}, result, {
					price: Number(response.prices[index]),
					title: `Result ${ index }`
				});

				currentSearchResults.set(item.id, Object.assign({}, item, { index }));

				return item;
			});
		}

		counter--;
		await new Promise(resolve => {
			setTimeout(resolve, 1000);
		});
	}

	return [];
}

async function purchase(itemId: string): Promise<void> {
	const item = currentSearchResults.get(itemId);
	await client.dataRequest(currentSearchId, item.index, item.price);

	let counter = 10;
	while (counter > 0) {
		const response = await client.dataResponse(currentSearchId);
		if (response) {
			console.log("YAY!!!! item: ", response);
			return;
		}

		counter--;
		await new Promise(resolve => {
			setTimeout(resolve, 1000);
		});
	}
}

initView(search, purchase);
initClient("http://localhost:4321", "http://54.173.39.87", () => ({
	encryptionPrivateKey: ENCRYPTION_PRIVATE_KEY,
	encryptionPublicKey: ENCRYPTION_PUBLIC_KEY,
	ethereumPrivateKey: "0xc6c699899a4b4661707c08b2e6b8118bc4a61abaddf74773dfc198e8b2110695"
})).then(c => client = c);
