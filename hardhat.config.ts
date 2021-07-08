import 'dotenv/config'
import '@openzeppelin/hardhat-upgrades'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-solhint'
import 'hardhat-deploy'
import './tasks/accounts'

import { HardhatUserConfig } from 'hardhat/types'
import { removeConsoleLog } from 'hardhat-preprocessor'

const accounts = {
  mnemonic: process.env.MNEMONIC,
}


const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`
      }
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts,
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts,
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts,
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts,
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    owner: 0,
    address1: 1,
    address2: 2,
    rewardTreasury: 3,
  },
  solidity: {
    version: '0.8.0',
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
