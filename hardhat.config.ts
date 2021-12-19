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

const accounts = {
  mnemonic: process.env.MNEMONIC,
}


const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    localhost: {
      saveDeployments: true,
    },
    mainnet: {
      url: process.env.NODE_URL || '',
      chainId: 1,
    },
    kovan: {
      url: process.env.NODE_URL,
      chainId: 42,
      accounts: [
        '7c57e2b0a4e4e5467d4467ec605f0780eac6fcdd7b061ef2e1a4427a078a09ce'
      ]
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: 0,
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
