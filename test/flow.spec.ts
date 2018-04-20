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

            it("submits a request with encrypted data and public key", () => {
                client = new Client({ adapter });
                client.queryRequest("Israel independence day 2018");

                expect(adapter.queryRequest).to.be.called;
            });

            it("successfully processes search results", () => {
                const searchResults: SearchResult[] = [
                    {
                        id: 0,
                        description: "State holidays in Israel 2018",
                        score: 10
                    }
                ];

                const event: QueryResponseEvent = {
                    encryptedResponse: crypto.publicEncrypt(buyerPublicKey, resultsToBuffer(searchResults))
                };

                expect(client.processQueryResponseEvent(event)).to.be.eql(searchResults);
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
            it("successfully processes query", () => {
                const event: QueryRequestEvent = {
                    buyerPublicKey: buyerPublicKey,
                    encryptedQuery: crypto.publicEncrypt(sellerPublicKey, queryToBuffer("Israel independence day 2018"))
                };

                const searchResults: SearchResult[] = [
                    {
                        id: 0,
                        description: "State holidays in Israel, 2018",
                        score: 10
                    },
                    {
                        id: 1,
                        description: "Declaration of independence, Israel, 1948",
                        score: 5
                    }
                ];
                (<sinon.SinonStub>searchAdapter.search).returns(searchResults);

                server.processQueryRequestEvent(event);
                expect(searchAdapter.search).to.be.calledWith("Israel independence day 2018");

                const queryResponse = (<sinon.SinonSpy>contractAdapter.queryResponse).getCall(0);
                expect(queryResponse).not.to.be.null;

                const decryptedSearchResults = JSON.parse(crypto.privateDecrypt(buyerPrivateKey, queryResponse.args[0]).toString());
                expect(decryptedSearchResults).to.be.eql({ results: searchResults });
            });
        });
    });
});
