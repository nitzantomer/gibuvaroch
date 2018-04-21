import Client from "./client";
import Server from "./server";
import ContractAdapter from "./contract-adapter";
import SearchAdapter from "./search-adapter";

const MODE = process.argv[2];
const { REDIS_URL, CONTRACT_ADDRESS, ETH_PRIVATE_KEY, REQUEST_ID, NETWORK } = process.env;

if (MODE == "--client") {
    const client = new Client({ adapter: new ContractAdapter({ network: NETWORK, address: CONTRACT_ADDRESS, ethPrivateKey: ETH_PRIVATE_KEY }) });

    (async () => {
        const step = process.argv[3];
        const first = process.argv[4];
        const second = Number(process.argv[5]); // for step 3

        await client.listenToEvents();

        if (step == "1") {  // queryRequest
            const query = first || "some query";
            const requestId = await client.queryRequest(query);
            console.log(`RequestId: ${requestId} for query: ${query}`);
        }

        if (step == "2") { // queryResponse
            const response = client.getSearchMetadata(first);
            if (response) {
                console.log(`haven't received queryResponse for ${first}`);
            } else {
                console.log(`got queryResponse for ${first}: ${response}`);
            }
        }

        if (step == "3") { // dataRequest
            // first is reqId, second is index
            await client.dataRequest(first, second);
            console.log(`RequestId: ${first} for index: ${second}`);
        }

        if (step == "4") { // dataResponse
            const response = client.getSearchDocument(first);
            if (response) {
                console.log(`haven't received dataResponse for ${first}`);
            } else {
                console.log(`got dataResponse for ${first}: ${response}`);
            }
        }
        return "done";
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
