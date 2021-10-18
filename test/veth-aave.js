'use strict'

const {ethers} = require('hardhat')
const {shouldBehaveLikePool} = require('./behavior/vesper-pool')
// const {shouldBehaveLikeStrategy} = require('./behavior/aave-strategy')
const {setupVPool} = require('./utils/setupHelper')

describe('pETH Pool with AaveStrategy', function () {
  beforeEach(async function () {
    this.accounts = await ethers.getSigners()
    await setupVPool(this, {
      pool: 'PETH',
      strategy: 'AaveV2StrategyETH',
      feeCollector: this.accounts[9],
      strategyType: 'aaveV2',
    })
    this.newStrategy = 'AaveV2StrategyETH'
  })

  shouldBehaveLikePool('pETH', 'WETH', 'aETH')
  // shouldBehaveLikeStrategy('pETH', 'WETH', 'aETH')
})
