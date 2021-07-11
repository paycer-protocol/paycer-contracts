import { ethers, deployments } from 'hardhat'
import { expect } from 'chai'

describe('LoyaltyProgram', function () {
  before(async function () {
    this.signers = await ethers.getSigners()
    this.owner = this.signers[0]
    this.account1 = this.signers[1]
  })

  beforeEach(async function () {
    await deployments.fixture(['PaycerToken', 'LoyaltyProgram'])
    this.paycer = await ethers.getContract('PaycerToken', this.owner)
    this.loyaltyProgram = await ethers.getContract('LoyaltyProgram', this.owner)
  })

  it('should has loyalty tier ASSOCIATE', async function() {
    expect(await this.loyaltyProgram.loyaltyTierOf(this.account1.address)).to.equal(0)

    await this.paycer.mint(this.account1.address, 5000)
    expect(await this.loyaltyProgram.loyaltyTierOf(this.account1.address)).to.equal(1)

    await this.paycer.mint(this.account1.address, 500)
    expect(await this.loyaltyProgram.loyaltyTierOf(this.account1.address)).to.equal(1)
  })

  it('should has loyalty tier SENIOR', async function() {
    expect(await this.loyaltyProgram.loyaltyTierOf(this.account1.address)).to.equal(0)

    await this.paycer.mint(this.account1.address, 15000)
    expect(await this.loyaltyProgram.loyaltyTierOf(this.account1.address)).to.equal(2)

    await this.paycer.mint(this.account1.address, 500)
    expect(await this.loyaltyProgram.loyaltyTierOf(this.account1.address)).to.equal(2)
  })

  it('should has loyalty tier MANAGER', async function() {
    expect(await this.loyaltyProgram.loyaltyTierOf(this.account1.address)).to.equal(0)

    await this.paycer.mint(this.account1.address, 35000)
    expect(await this.loyaltyProgram.loyaltyTierOf(this.account1.address)).to.equal(3)

    await this.paycer.mint(this.account1.address, 500)
    expect(await this.loyaltyProgram.loyaltyTierOf(this.account1.address)).to.equal(3)
  })

  it('should has loyalty tier PARTNER', async function() {
    expect(await this.loyaltyProgram.loyaltyTierOf(this.account1.address)).to.equal(0)

    await this.paycer.mint(this.account1.address, 100000)
    expect(await this.loyaltyProgram.loyaltyTierOf(this.account1.address)).to.equal(4)

    await this.paycer.mint(this.account1.address, 500)
    expect(await this.loyaltyProgram.loyaltyTierOf(this.account1.address)).to.equal(4)
  })
})
