module.exports = {
	// See <http://truffleframework.com/docs/advanced/configuration>
	// to customize your Truffle configuration!
	networks: {
		development: {
			host: "127.0.0.1",
			port: 8545,
      network_id: "*", // Match any network id
      from: process.env.OWNER_ACCOUNT
		},
		ropsten:  {
			network_id: 3,
			host: "localhost",
			port:  8545,
			gas:   2900000
		}
	},
	rpc: {
		host: 'localhost',
		post:8080
	}
};
