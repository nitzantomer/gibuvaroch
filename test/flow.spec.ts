import * as chai from "chai";
import Client from "../src/client";
import ContractAdapter from "../src/contract-adapter";
import { stubInterface } from "ts-sinon";
import * as sinonChai from "sinon-chai";

const { expect } = chai;

chai.use(sinonChai);

const CONTRACT_ADDRESS = "some-address";

describe("General flow", () => {
    describe("Client", () => {
        describe("key management", () => {
            let client: Client;

            beforeEach(() => {
                client = new Client({
                    adapter: new ContractAdapter({ address: CONTRACT_ADDRESS })
                });
            });

            it("gets public key from the contract", () => {
                const sellerPublicKey = client.getSellerPublicKey();
                expect(sellerPublicKey.toString()).not.to.be.empty;
            });

            it("gets private and public key of the buyer", () => {
                expect(client.getBuyerPublicKey().toString()).not.to.be.empty;
                expect(client.getBuyerPrivateKey().toString()).not.to.be.empty;
            });
        });

        describe("query flow", () => {
            let client: Client;

            it("submits a request with encrypted data and public key", () => {
                const adapter = stubInterface<ContractAdapter>();
                client = new Client({ adapter });
                client.queryData("Israel independence day 2018");

                expect(adapter.queryData).to.be.called;
            });
        });
    });
});
