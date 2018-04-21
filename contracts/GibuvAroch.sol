pragma solidity ^0.4.23;

import "./Ownable.sol";

contract GibuvAroch is Ownable {
	struct PriceList {
		uint[] prices;
		bool exists;
	}

	mapping (bytes32 => PriceList) private prices;
	string public publicKey;

	event LogQueryRequest(bytes32 reqId, string buyerPublicKey, string encryptedQuery);
	event LogQueryResponse(bytes32 reqId, uint[] dataPrices, string encryptedQueryResults);
	event LogDataRequest(bytes32 reqId, uint index);
	event LogDataResponse(bytes32 reqId, string encryptedData);

	constructor(string _publicKey) public {
        publicKey = _publicKey;
    }

    function getPublicKey() public view returns (string) {
        return publicKey;
    }

    // queryRequest - called by buyer
    // the query should be encrypted with the publicKey defined by the contract
	function queryRequest(bytes32 reqId, string buyerPublicKey, string encryptedQuery) public {
		require(!prices[reqId].exists);

		emit LogQueryRequest(reqId, buyerPublicKey, encryptedQuery);
	}

    // queryResponse - called by the seller
    // dataPrices contains the prices for the results list encrypted with the
    // buyerPublicKey
	function queryResponse(bytes32 reqId, uint[] dataPrices, string encryptedQueryResults) public onlyOwner {
		prices[reqId] = PriceList({
			prices: dataPrices,
			exists: true
		});

		emit LogQueryResponse(reqId, dataPrices, encryptedQueryResults);
	}

    // dataRequest - called by the buyer
    // the buyer wants to buy the query result with given index.
    // The buyer should pay the ether amount defined by the price in the given index
	function dataRequest(bytes32 reqId, uint index) public payable {
		require(prices[reqId].exists);
		require(index < prices[reqId].prices.length);
		require(msg.value == prices[reqId].prices[index]);

		emit LogDataRequest(reqId, index);
	}

    // dataResponse - called by the seller
    // returns the requested data encrypted with the buyerPublicKey 
	function dataResponse(bytes32 reqId, string encryptedData) public onlyOwner {
		emit LogDataResponse(reqId, encryptedData);
	}
}
