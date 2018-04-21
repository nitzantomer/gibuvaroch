import * as chai from "chai";
import Client from "../src/client";
import Server from "../src/server";
import ContractAdapter, { ContractAdapterInterface } from "../src/contract-adapter";
import { stubInterface } from "ts-sinon";
import * as sinonChai from "sinon-chai";
import * as shell from "shelljs";
import * as fs from "fs";
import { QueryRequestEvent, QueryResponseEvent } from "../src/interfaces";
import { getPublicKey, getPrivateKey, queryToBuffer, resultsToBuffer } from "../src/utils";
import * as crypto from "crypto";
import { SearchAdapterInterface, SearchResult } from "../src/search-adapter";

const { expect } = chai;

chai.use(sinonChai);

const CONTRACT_ADDRESS = "some-address";

const buyerPublicKey: crypto.RsaPublicKey = getPublicKey(`${__dirname}/../../temp-keys/buyer/key.pub.pem`);
const buyerPrivateKey: crypto.RsaPublicKey = getPublicKey(`${__dirname}/../../temp-keys/buyer/key`);

const sellerPublicKey: crypto.RsaPublicKey = getPublicKey(`${__dirname}/../../temp-keys/seller/key.pub.pem`);
const sellerPrivateKey: crypto.RsaPrivateKey = getPrivateKey(`${__dirname}/../../temp-keys/seller/key`);

describe("General flow", () => {
    describe("Client", () => {
        let client: Client;
        let adapter: ContractAdapter;

        beforeEach(() => {
            adapter = stubInterface<ContractAdapter>();
            (<sinon.SinonStub>adapter.getSellerPublicKey).returns(sellerPublicKey);

            client = new Client({ adapter });
        });

        describe("key management", () => {
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

            it("submits a request with encrypted data and public key", async () => {
                client = new Client({ adapter });
                await client.queryRequest("Israel independence day 2018");

                return expect(adapter.queryRequest).to.be.called;
            });

            it("successfully processes search results", () => {
                const results: SearchResult[] = [
                    {
                        id: "important-file",
                        description: "State holidays in Israel 2018",
                        score: 10
                    }
                ];

                const prices = [ 10 ];

                const event: QueryResponseEvent = {
                    requestId: "test-request-id",
                    prices,
                    encryptedResponse: crypto.publicEncrypt(buyerPublicKey, resultsToBuffer(results))
                };

                client.processQueryResponseEvent(event);
                expect(client.getSearchMetadata("test-request-id")).to.be.eql({ results, prices });
            });
        });
    });

    describe("Server", () => {
        let server: Server;
        let contractAdapter: ContractAdapterInterface;
        let searchAdapter: SearchAdapterInterface;

        beforeEach(() => {
            contractAdapter = stubInterface<ContractAdapterInterface>();
            searchAdapter = stubInterface<SearchAdapterInterface>();
            server = new Server({ contractAdapter, searchAdapter });
        });

        describe("key management", () => {
            it("returns seller private key", () => {
                expect(server.getSellerPrivateKey().toString()).not.to.be.empty;
            });

            it("keys match", () => {
                const encryptedData = crypto.publicEncrypt(server.getSellerPublicKey(), new Buffer("hello"));
                const decryptedData = crypto.privateDecrypt(server.getSellerPrivateKey(), encryptedData).toString();
                expect(decryptedData).to.be.eql("hello");
            });
        });

        describe("regular flow", () => {
            it("successfully processes query", async () => {
                const event: QueryRequestEvent = {
                    requestId: "test-request-id",
                    buyerPublicKey: buyerPublicKey,
                    encryptedQuery: crypto.publicEncrypt(sellerPublicKey, queryToBuffer("Israel independence day 2018"))
                };

                const results: SearchResult[] = [
                    {
                        id: "result-1",
                        description: "State holidays in Israel, 2018",
                        score: 10
                    },
                    {
                        id: "result-2",
                        description: "Declaration of independence, Israel, 1948",
                        score: 5
                    }
                ];

                const prices = [20, 10];

                (<sinon.SinonStub>searchAdapter.search).returns({ results, prices });

                await server.processQueryRequestEvent(event);
                await expect(searchAdapter.search).to.be.calledWith("Israel independence day 2018");

                const queryResponse = (<sinon.SinonSpy>contractAdapter.queryResponse).getCall(0);
                await expect(queryResponse).not.to.be.null;

                await expect(queryResponse.args[0]).to.be.eql("test-request-id");

                await expect(queryResponse.args[1]).to.be.eql(prices);

                const decryptedSearchResults = JSON.parse(crypto.privateDecrypt(buyerPrivateKey, queryResponse.args[2]).toString());
                await expect(decryptedSearchResults).to.be.eql({ results: results });
            });
        });
    });
});
