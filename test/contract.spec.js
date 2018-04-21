const fs = require("fs");

const chai = require("chai");
const Ganache = require("ganache-core");
const { expect } = chai;
const _ = require("lodash");

const GibuvAroch = artifacts.require("GibuvAroch");
const sellerPublicKey = fs.readFileSync(`${__dirname}/../temp-keys/seller/key.pub.pem`).toString();

contract("GibuvAroch", (accounts) => {
    it("should return public key", async () => {
        const instance = await GibuvAroch.deployed();
        const publicKey = await instance.getPublicKey();

        return expect(publicKey).to.be.eql(sellerPublicKey);
    });

});
