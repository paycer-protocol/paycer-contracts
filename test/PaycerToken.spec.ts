import { ethers } from 'hardhat'
import { expect } from 'chai'

describe('PaycerToken', function () {
  before(async function () {
    this.PaycerToken = await ethers.getContractFactory('PaycerToken')
    this.signers = await ethers.getSigners()
    this.alice = this.signers[0]
    this.bob = this.signers[1]
    this.carol = this.signers[2]
  })

  beforeEach(async function () {
    this.paycer = await this.PaycerToken.deploy(1000)
    await this.paycer.deployed()
  })

  it('should have correct name, symbol, decimal and total supply', async function () {
    const name = await this.paycer.name()
    const symbol = await this.paycer.symbol()
    const decimals = await this.paycer.decimals()
    const totalSupply = await this.paycer.totalSupply()

    expect(name).to.equal('PaycerToken')
    expect(symbol).to.equal('PCR')
    expect(decimals).to.equal(18)
    expect(totalSupply.toNumber()).to.equal(1000)
  })

  it('should allow owner to mint token', async function () {
    await this.paycer.mint(this.alice.address, 1000)
    await this.paycer.mint(this.bob.address, 1000)

    const bob = await this.paycer.connect(this.bob);
    await expect(bob.mint(this.carol.address, 1000)).to.be.revertedWith('Ownable: caller is not the owner')

    const totalSupply = await this.paycer.totalSupply()
    const balanceOfAlice = await this.paycer.balanceOf(this.alice.address)
    const balanceOfBob = await this.paycer.balanceOf(this.bob.address)
    const balanceOfCarol = await this.paycer.balanceOf(this.carol.address)

    expect(totalSupply.toNumber()).to.equal(3000)
    expect(balanceOfAlice).to.equal(2000)
    expect(balanceOfBob).to.equal(1000)
    expect(balanceOfCarol).to.equal(0)
  })

  it('should not allow others to mint token', async function () {
    const bob = await this.paycer.connect(this.bob)
    const carol = await this.paycer.connect(this.carol);

    await expect(bob.mint(this.bob.address, 1000)).to.be.revertedWith('Ownable: caller is not the owner')
    await expect(carol.mint(this.carol.address, 1000)).to.be.revertedWith('Ownable: caller is not the owner')
    await expect(bob.mint(this.carol.address, 1000)).to.be.revertedWith('Ownable: caller is not the owner')
    await expect(carol.mint(this.bob.address, 1000)).to.be.revertedWith('Ownable: caller is not the owner')
  })

  it('Should transfer tokens between accounts', async function () {
    const alice = await this.paycer.connect(this.alice)

    await alice.transfer(this.bob.address, 100)
    const balanceOfBob = await this.paycer.balanceOf(this.bob.address)
    expect((balanceOfBob).toNumber()).to.equal(100)

    await alice.transfer(this.carol.address, 100)
    const balanceOfCarol = await this.paycer.balanceOf(this.carol.address)
    expect((balanceOfCarol).toNumber()).to.equal(100)
  })

  it('should not send tokens if the balance has not enougth tokens', async function () {
    const alice = await this.paycer.connect(this.alice)
    const carol = await this.paycer.connect(this.carol)

    await expect(alice.transfer(this.bob.address, 10000000)).to.be.revertedWith('ERC20: transfer amount exceeds balance')
    await expect(carol.transfer(this.alice.address, 1)).to.be.revertedWith('ERC20: transfer amount exceeds balance')
  })
})