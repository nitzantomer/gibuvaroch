import Client from "./client";
import Server from "./server";
import ContractAdapter from "./contract-adapter";

const MODE = process.argv[2];
const { CONTRACT_ADDRESS } = process.env;

if (MODE == "--client") {
    const client = new Client({ adapter: new ContractAdapter({ address: CONTRACT_ADDRESS }) });

    (async () => {
        await client.adapter.test();
    })().then(console.log, console.error);

}
