'use strict'

const {ethers} = require('hardhat')
const {shouldBehaveLikePool} = require('./behavior/vesper-pool')
const {shouldBehaveLikeStrategy} = require('./behavior/compound-strategy')
const {setupVPool} = require('./utils/setupHelper')

describe('pETH Pool with Compound strategy', function () {
  beforeEach(async function () {
    this.accounts = await ethers.getSigners()
    await setupVPool(this, {
      pool: 'PETH',
      strategy: 'CompoundStrategyETH',
      feeCollector: this.accounts[9],
      strategyType: 'compound',
    })

    this.newStrategy = 'CompoundStrategyETH'
  })

  shouldBehaveLikePool('pETH', 'WETH', 'cETH')
  shouldBehaveLikeStrategy('pETH', 'WETH')
})
