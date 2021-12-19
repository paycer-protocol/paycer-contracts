import 'dotenv/config'
import '@openzeppelin/hardhat-upgrades'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-solhint'
import 'hardhat-deploy'
import 'hardhat-typechain'
import './tasks/accounts'

import { HardhatUserConfig } from 'hardhat/types'
import { removeConsoleLog } from 'hardhat-preprocessor'


// TODO: create final accounts and provide it as env var
const accounts = {
  mnemonic: '7c57e2b0a4e4e5467d4467ec605f0780eac6fcdd7b061ef2e1a4427a078a09ce',
}


const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    localhost: {
      saveDeployments: true,
    },
    mainnet: {
      url: 'https://mainnet.infura.io/v3/e687cba7b033449abeb865f24ef82f83',
      chainId: 1,
      accounts
    },
    kovan: {
      url: 'https://kovan.infura.io/v3/e687cba7b033449abeb865f24ef82f83',
      chainId: 42,
      accounts
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: 0,
    rewardTreasury: 1,
  },
  solidity: {
    version: '0.6.12',
    settings: {
      optimizer: {
        enabled: true,
        runs: 800
      },
    }
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts'
  },
  mocha: {
    timeout: 20000
  },
  preprocess: {
    eachLine: removeConsoleLog(bre => bre.network.name !== 'hardhat' && bre.network.name !== 'localhost'),
  },
}

export default config;
