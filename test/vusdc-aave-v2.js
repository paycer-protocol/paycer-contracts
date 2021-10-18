'use strict'

const {ethers} = require('hardhat')
const {shouldBehaveLikePool} = require('./behavior/vesper-pool')
const {shouldBehaveLikeStrategy} = require('./behavior/aave-strategy')
const {setupVPool} = require('./utils/setupHelper')

describe('pUSDC Pool with AaveV2Strategy', function () {
  beforeEach(async function () {
    this.accounts = await ethers.getSigners()
    await setupVPool(this, {
      pool: 'PUSDC',
      strategy: 'AaveV2StrategyUSDC',
      feeCollector: this.accounts[9],
      strategyType: 'aave',
    })
    this.newStrategy = 'AaveV2StrategyUSDC'
  })

  shouldBehaveLikePool('pUSDC', 'USDC', 'aUSDC')
  shouldBehaveLikeStrategy('pUSDC', 'USDC', 'aUSDC')
})
