const chai = require("chai");
const Ganache = require("ganache-core");
const { expect } = chai;
const _ = require("lodash");

const GibuvAroch = artifacts.require("GibuvAroch");

contract("GibuvAroch", (accounts) => {
    it("should return public key", async () => {
        const instance = await GibuvAroch.deployed();
        const publicKey = _.trim(web3.toAscii(await instance.publicKey.call()));

        return expect(publicKey).to.be.eql("my public key\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000");
    });

});
