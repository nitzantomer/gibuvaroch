import Client from "./client";
import Server from "./server";
import ContractAdapter from "./contract-adapter";
import SearchAdapter from "./search-adapter";

const MODE = process.argv[2];
const { REDIS_URL, CONTRACT_ADDRESS, ETH_PRIVATE_KEY, REQUEST_ID, NETWORK } = process.env;

if (MODE == "--client") {
    const client = new Client({ adapter: new ContractAdapter({ network: NETWORK, address: CONTRACT_ADDRESS, ethPrivateKey: ETH_PRIVATE_KEY }) });

    (async () => {
        const id = process.argv[3];
        const index = Number(process.argv[4]);

        await client.listenToEvents();

        console.log("SEARCH METADATA");
        for (const id of client.searchMetadata.keys()) {
            console.log(id);
            console.log(client.getSearchMetadata(id));
        }

        console.log("SEARCH DOCUMENTS");
        for (const id of client.documents.keys()) {
            console.log(id);
            console.log(client.getSearchDocument(id));
        }

        if (!id && !index) {
            const requestId = await client.queryRequest("some query");
            console.log(`RequestId: ${requestId}`);
        } else {
            await client.dataRequest(id, index);
        }
    })().then(console.log, console.error);

} else if (MODE == "--server") {
    const server = new Server({
        searchAdapter: new SearchAdapter(),
        contractAdapter: new ContractAdapter({ network: NETWORK, address: CONTRACT_ADDRESS, ethPrivateKey: ETH_PRIVATE_KEY })
    });

    setInterval(async () => {
        await server.listenToEvents();
    }, 5000);
}
