pragma solidity ^0.4.23;

import "./Ownable.sol";

contract GibuvAroch is Ownable {
	struct PriceList {
		uint[] prices;
		bool exists;
	}

	mapping (bytes32 => PriceList) private prices;

	bytes32 public constant publicKey = "my public key";

	event LogQueryRequest(bytes32 reqId, bytes32 userPublicKey, string query);
	event LogQueryResponse(bytes32 reqId, uint[] dataPrices, string encryptedQueryResults);

	event LogDataRequest(bytes32 reqId, uint index);
	event LogDataResponse(bytes32 reqId, string encryptedData);

	function queryRequest(bytes32 reqId, bytes32 userPublicKey, string query) public {
		require(!prices[reqId].exists);

		emit LogQueryRequest(reqId, userPublicKey, query);
	}

	function queryResponse(bytes32 reqId, uint[] dataPrices, string encryptedQueryResults) onlyOwner {
		prices[reqId] = PriceList({
			prices: dataPrices,
			exists: true
		});

		emit LogQueryResponse(reqId, dataPrices, encryptedQueryResults);
	}

	function dataRequest(bytes32 reqId, uint index) public payable {
		require(prices[reqId].exists);
		require(msg.value == prices[reqId].prices[index]);

		emit LogDataRequest(reqId, index);
	}

	function dataResponse(bytes32 reqId, string encryptedData) public {
		emit LogDataResponse(reqId, encryptedData);
	}
}