import { ethers, deployments } from 'hardhat'
import { expect } from 'chai'

const { expectRevert } = require('@openzeppelin/test-helpers')

describe('StakingRewards', function () {
  before(async function () {
    const [owner, address1, address2] = await ethers.getSigners()
    this.owner = owner
    this.address1 = address1
    this.address2 = address2
    this.totalRewardSupply = 150000000
  })

  beforeEach(async function () {
    await deployments.fixture(['PaycerToken', 'StakingRewards', 'RewardTreasury'])

    this.stakingContract = await ethers.getContract('StakingRewards', this.owner)
    this.rewardTreasury = await ethers.getContract('RewardTreasury', this.owner)
    this.paycer = await ethers.getContract('PaycerToken', this.owner)


    this.paycer.mint(this.rewardTreasury.address, this.totalRewardSupply)
    this.paycer.mint(this.address1.address, 1000)
    this.paycer.mint(this.address2.address, 1000)
  })

  describe('stake', function () {
    it('should have correct token treasury balance', async function () {    
      expect(await this.paycer.balanceOf(this.rewardTreasury.address)).to.equal(this.totalRewardSupply)
      expect(await this.stakingContract.treasurySupply()).to.equal(this.totalRewardSupply)
    })
  
    it('should not allow enter if not enough approve', async function () {
      await expectRevert(
        this.stakingContract.connect(this.address1).stake(100, 0),
        'ERC20: transfer amount exceeds allowance'
      )
  
      await this.paycer.connect(this.address1).approve(this.stakingContract.address, 50);
  
      await expectRevert(
        this.stakingContract.connect(this.address1).stake(100, 0),
        'ERC20: transfer amount exceeds allowance'
      )
    })
  
    it('should allow enter if enough approve', async function () {
      await this.paycer.connect(this.address1).approve(this.stakingContract.address, 100)
      this.stakingContract.connect(this.address1).stake(100, 0)
  
      expect(await this.paycer.balanceOf(this.address1.address)).to.equal(900)
      expect(await this.paycer.balanceOf(this.stakingContract.address)).to.equal(100)
    })
  
    it('should not allow staking with invalid token amount', async function () {
      const address1 = await this.paycer.connect(this.address1)
      await address1.approve(this.stakingContract.address, 100)
  
      await expect(this.stakingContract.connect(this.address1).stake(0, 0)).to.be.revertedWith('Amount must be greater than 0')
      await expect(this.stakingContract.connect(this.address1).stake(10000, 0)).to.be.revertedWith('Not enough tokens in the wallet')
    })
  
    it('should allow staking with valid token amount', async function () {
      const address1 = await this.paycer.connect(this.address1)
      await address1.approve(this.stakingContract.address, 200)
  
      await this.stakingContract.connect(this.address1).stake(100, 0)
      expect(await this.paycer.balanceOf(this.address1.address)).to.equal(900)
      expect(await this.stakingContract.stakedBalanceOf(this.address1.address)).to.equal(100)
  
      await this.stakingContract.connect(this.address1).stake(100, 0)
      expect(await this.paycer.balanceOf(this.address1.address)).to.equal(800)
      expect(await this.stakingContract.stakedBalanceOf(this.address1.address)).to.equal(200)
  
      expect(await this.stakingContract.totalStakedBalances()).to.equal(200)
  
      await expectRevert(
        this.stakingContract.connect(this.address1).stake(1000, 0),
        'Not enough tokens in the wallet'
      )
    })
  })

  describe('withdraw', function () {
    it('should not allow withdraw with invalid amount', async function () {
      const address1 = await this.paycer.connect(this.address1)
      await address1.approve(this.stakingContract.address, 200)


      await expectRevert(
        this.stakingContract.connect(this.address1).withdraw(0),
        'Amount must be greater than 0'
      )

      await expectRevert(
        this.stakingContract.connect(this.address1).withdraw(1000),
        'Amount must be greater or equal to staked amount'
      )
    })

    it('should not allow if lock period not exceeded', async function () {
      const address1 = await this.paycer.connect(this.address1)
      await address1.approve(this.stakingContract.address, 200)
  
      await this.stakingContract.connect(this.address1).stake(100, 14)

      await expectRevert(
        this.stakingContract.connect(this.address1).withdraw(100),
        'Lock period not exceeded'
      )

      await this.stakingContract.connect(this.address1).stake(25, 1)

      await expectRevert(
        this.stakingContract.connect(this.address1).withdraw(100),
        'Lock period not exceeded'
      )

      await this.stakingContract.connect(this.address1).stake(25, 0)

      await expectRevert(
        this.stakingContract.connect(this.address1).withdraw(100),
        'Lock period not exceeded'
      )
      
    })

    it('should allow withdraw', async function () {
      await this.paycer.connect(this.address1).approve(this.stakingContract.address, 200)

      await this.stakingContract.connect(this.address1).stake(200, 0)
      expect(await this.paycer.balanceOf(this.address1.address)).to.equal(800)
      expect(await this.stakingContract.stakedBalanceOf(this.address1.address)).to.equal(200)
      expect(await this.stakingContract.totalStakedBalances()).to.equal(200)

      await this.stakingContract.connect(this.address1).withdraw(100)
      expect(await this.paycer.balanceOf(this.address1.address)).to.equal(900)
      expect(await this.stakingContract.stakedBalanceOf(this.address1.address)).to.equal(100)
      expect(await this.stakingContract.totalStakedBalances()).to.equal(100)

      await this.stakingContract.connect(this.address1).withdraw(100)
      expect(await this.paycer.balanceOf(this.address1.address)).to.equal(1000)
      expect(await this.stakingContract.stakedBalanceOf(this.address1.address)).to.equal(0)
      expect(await this.stakingContract.totalStakedBalances()).to.equal(0)

      await expectRevert(
        this.stakingContract.connect(this.address1).withdraw(1000),
        'Amount must be greater or equal to staked amount'
      )
    })
  })

  describe('claim', function () {
    it('should not claim by unauthorized acounts.', async function () {
      await expectRevert(
        this.rewardTreasury.connect(this.address1).claim(this.address1.address, 0),
        'revert Ownable: caller is not the owner'
      )

      await expectRevert(
        this.rewardTreasury.connect(this.address1).claim(this.address1.address, 29723974),
        'revert Ownable: caller is not the owner'
      )

      await expectRevert(
        this.rewardTreasury.connect(this.address1).claim(this.address1.address, 100),
        'revert Ownable: caller is not the owner'
      )

      await expectRevert(
        this.rewardTreasury.connect(this.address1).claim(this.address2.address, 100),
        'revert Ownable: caller is not the owner'
      )

      await expectRevert(
        this.rewardTreasury.connect(this.address2).claim(this.address2.address, 1000),
        'revert Ownable: caller is not the owner'
      )

      await expectRevert(
        this.rewardTreasury.connect(this.address2).claim(this.address1.address, 1000),
        'revert Ownable: caller is not the owner'
      )

      await expectRevert(
        this.rewardTreasury.claim(this.address1.address, 1000),
        'revert Ownable: caller is not the owner'
      )
    })

    it('should allow claim', async function () {
      const claimAmount = 10

      // expect(await this.stakingContract.treasurySupply()).to.equal(this.totalRewardSupply)
      // expect(await this.stakingContract.rewardBalanceOf(this.address1.address)).to.equal(claimAmount)

      // await this.stakingContract.connect(this.address1).claim()

      // expect(await this.stakingContract.treasurySupply()).to.equal(this.totalRewardSupply - claimAmount)
      // expect(await this.stakingContract.rewardBalanceOf(this.address1.address)).to.equal(0)
      // expect(await this.paycer.balanceOf(this.address1.address)).to.equal(1000 + claimAmount)
    })
  })
})
