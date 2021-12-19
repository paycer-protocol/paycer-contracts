# Paycer protocol - Contracts

These are the contracts for Paycer protocol.

# Requirements
- NodeJS
- Yarn
- Git
- VSCode
- VSCode Solidity Plugin
- MetaMask

# Obtain API Keys
- https://infura.io/dashboard
- https://www.alchemy.com/
- https://etherscan.io/


# Commands
```
# show all commands
npx hardhat

# compile code
npx hardhat compile

# run test
npx hardhat test

# Run node
npx hardhat node

# deploy contract to node on localhost
npx hardhat --network <networkName> deploy

# deploy specified script by tagname
npx hardhat --network kovan deploy --tags Staking
```

# Public Testnet Deployment
```
# Retrieve account infos and import one or more accounts to MetaMask
hh accounts --net kovan

# Obtain test tokens on faucet
https://faucet.kovan.network/

# Deploy token to kovan testnet
npx hardhat run --network kovan scripts/deploy-paycer-token.ts

# Verify contract token to kovan testnet
# Remove unnecessary contracts and clear the artifacts otherwise these will also be part of the verified contract.
npx clean
npx hardhat verify --network kovan DEPLOYED_CONTRACT_ADDRESS {address}


# Check transaction on kovan explorer
https://kovan.etherscan.io/tx/{transactionID}
```

# Add hardhat network to MetaMask
Network Name:
Hardhat Network Localhost

New RPC URL:
http://127.0.0.1:8545/

Chain ID:
31337

Currency Symbol:
ETH


# Knowledge Base
[Ethereum Developers](https://ethereum.org/de/developers/)
[Hardhat](https://hardhat.org/)
[Deployment](https://hardhat.org/plugins/hardhat-deploy.html)