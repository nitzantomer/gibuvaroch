import Client from "./client";
import Server from "./server";
import ContractAdapter from "./contract-adapter";
import SearchAdapter from "./search-adapter";

const MODE = process.argv[2];
const { CONTRACT_ADDRESS, ETH_PRIVATE_KEY } = process.env;

if (MODE == "--client") {
    const client = new Client({ adapter: new ContractAdapter({ address: CONTRACT_ADDRESS, ethPrivateKey: ETH_PRIVATE_KEY }) });

    (async () => {
        const requestId = await client.queryRequest("some query");
        console.log(`RequestId: ${requestId}`);
    })().then(console.log, console.error);

} else if (MODE == "--server") {
    const server = new Server({
        searchAdapter: new SearchAdapter(),
        contractAdapter: new ContractAdapter({ address: CONTRACT_ADDRESS, ethPrivateKey: ETH_PRIVATE_KEY })
    });

    (async () => {
        await server.listenToEvents();
    })();
}
