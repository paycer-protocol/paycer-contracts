'use strict'

const {ethers} = require('hardhat')
const {shouldBehaveLikePool} = require('./behavior/vesper-pool')
const {shouldBehaveLikeStrategy} = require('./behavior/compound-strategy')
const {setupVPool} = require('./utils/setupHelper')

describe('pUSDC Pool with Compound strategy', function () {
  beforeEach(async function () {
    this.accounts = await ethers.getSigners()
    await setupVPool(this, {
      pool: 'PUSDC',
      strategy: 'CompoundStrategyUSDC',
      feeCollector: this.accounts[9],
      strategyType: 'compound',
    })

    this.newStrategy = 'CompoundStrategyUSDC'
  })

  shouldBehaveLikePool('pUSDC', 'USDC', 'cUSDC')
  shouldBehaveLikeStrategy('pUSDC', 'USDC')
})
