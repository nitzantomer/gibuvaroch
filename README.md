# gibuvaroch

A hackathon project by Doody Parizada, Nitzan Tomer and Kirill Maximov.
Created during the LongHash Hackathon Tokyo 2018.

## Demo

https://docs.google.com/presentation/d/13R6VKEuX3yrq7KyjYN4d4E5-8inwyslEGAIjHh7fg78/edit?usp=sharing

## installation guide
```bash
npm run install
./generate-keys.sh
npm run test
npm run start-node
npm run contract-test
```

## running server
CONTRACT_ADDRESS=<address> ETH_PRIVATE_KEY=<key> NETWORK="http://localhost:8545" node dist/index.js --server

## running client
```
./node_modules/.bin/tsc -p webclient/scripts/
./node_modules/.bin/tsc -p web3proxy/scripts/
mkdir -p webclient/styles/bin
./node_modules/.bin/stylus -o webclient/styles/bin webclient/styles/src
```

## running test client
CONTRACT_ADDRESS=<address> ETH_PRIVATE_KEY=<key> NETWORK="http://localhost:8545" node dist/index.js --client <step> <first> <second>
