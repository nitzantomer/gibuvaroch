import * as chai from "chai";
import Client from "../src/client";
import Server from "../src/server";
import ContractAdapter, { ContractAdapterInterface } from "../src/contract-adapter";
import { stubInterface } from "ts-sinon";
import * as sinonChai from "sinon-chai";
import * as shell from "shelljs";
import * as fs from "fs";
import { NewQueryEvent } from "../src/interfaces";
import { getPublicKey, getPrivateKey, queryToBuffer } from "../src/utils";
import * as crypto from "crypto";
import { SearchAdapterInterface } from "../src/search-adapter";

const { expect } = chai;

chai.use(sinonChai);

const CONTRACT_ADDRESS = "some-address";

describe("General flow", () => {
    describe("Client", () => {
        let client: Client;
        let adapter: ContractAdapter;

        beforeEach(() => {
            adapter = stubInterface<ContractAdapter>();
            (<sinon.SinonStub>adapter.getSellerPublicKey).returns(getPublicKey(`${__dirname}/../../temp-keys/buyer/key.pub.pem`));

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
                client.queryData("Israel independence day 2018");

                expect(adapter.queryData).to.be.called;
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
            const buyerPublicKey: crypto.RsaPublicKey = getPublicKey(`${__dirname}/../../temp-keys/buyer/key.pub.pem`);
            const sellerPublicKey: crypto.RsaPublicKey = getPublicKey(`${__dirname}/../../temp-keys/seller/key.pub.pem`);

            it("successfully decrypts query", () => {
                const event: NewQueryEvent = {
                    buyerPublicKey: buyerPublicKey,
                    encryptedQuery: crypto.publicEncrypt(sellerPublicKey, queryToBuffer("Israel independence day 2018"))
                };

                server.processNewQueryEvent(event);
                expect(searchAdapter.search).to.be.calledWith("Israel independence day 2018");
            });
        });
    });
});
