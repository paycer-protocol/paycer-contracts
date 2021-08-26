import { ethers, waffle, deployments } from 'hardhat'
import { expect } from 'chai'

const { expectRevert } = require('@openzeppelin/test-helpers')

describe('StakedPaycerToken', function () {
  before(async function () {
    const [owner, address1, address2] = await ethers.getSigners()
    this.owner = owner
    this.address1 = address1
    this.address2 = address2
    this.totalRewardSupply = 150000000
  })

  beforeEach(async function () {
    await deployments.fixture(['PaycerToken', 'StakedPaycerToken', 'RewardTreasury', 'PortfolioRegistry'])

    this.stakingContract = await ethers.getContract('StakedPaycerToken', this.owner)
    this.rewardTreasury = await ethers.getContract('RewardTreasury', this.owner)
    this.paycer = await ethers.getContract('PaycerToken', this.owner)


    this.paycer.mint(this.rewardTreasury.address, this.totalRewardSupply)
    this.paycer.mint(this.address1.address, 1000)
    this.paycer.mint(this.address2.address, 1000)
  })

  describe('stake', function () {
    it('should have correct token treasury balance', async function () {    
      // expect(await this.paycer.balanceOf(this.rewardTreasury.address)).to.equal(this.totalRewardSupply)
      // expect(await this.stakingContract.treasurySupply()).to.equal(this.totalRewardSupply)
    })
  
    it('should not allow enter if not enough approve', async function () {
      await expectRevert(
        this.stakingContract.connect(this.address1).stake(100),
        'ERC20: transfer amount exceeds allowance'
      )
  
      await this.paycer.connect(this.address1).approve(this.stakingContract.address, 50);
  
      await expectRevert(
        this.stakingContract.connect(this.address1).stake(100),
        'ERC20: transfer amount exceeds allowance'
      )
    })
  })
})
