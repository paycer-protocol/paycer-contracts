'use strict'
const {ethers} = require('hardhat')
const {shouldBehaveLikePool} = require('./behavior/vesper-pool')
// const {shouldBehaveLikeStrategy} = require('./behavior/aave-strategy')
const {setupVPool} = require('./utils/setupHelper')

describe('pDAI Pool with MultiStrategy', function () {
  beforeEach(async function () {
    this.accounts = await ethers.getSigners()
    await setupVPool(this, {
      pool: 'pDAI',
      strategy: 'AaveV2StrategyMulti',
      feeCollector: this.accounts[9],
      strategyType: 'aaveV2',
    })

    this.newStrategy = 'AaveV2StrategyMulti'
  })

  shouldBehaveLikePool('pDai', 'DAI', 'aDai')
  // shouldBehaveLikeStrategy('vDai', 'DAI', 'aDai')
})
