const GibuvAroch = artifacts.require("GibuvAroch");
const fs = require("fs");

module.exports = function(deployer) {
  const sellerPublicKey = fs.readFileSync(`${__dirname}/../temp-keys/seller/key.pub.pem`).toString();

  deployer.deploy(GibuvAroch, sellerPublicKey);
};

