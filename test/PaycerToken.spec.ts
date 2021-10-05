import { ethers, deployments } from 'hardhat'
import { expect } from 'chai'

/*describe('PaycerToken', function () {
  before(async function () {
    this.signers = await ethers.getSigners()
    this.owner = this.signers[0]
    this.address1 = this.signers[1]
    this.address2 = this.signers[2]
    this.initialSupply = 1000000
    this.totalSupply = 750000000
  })

  beforeEach(async function () {
    await deployments.fixture(['PaycerToken'])
    this.paycer = await ethers.getContract('PaycerToken', this.owner)
  })

  it('should have correct name, symbol, decimal and total supply', async function () {
    expect(await this.paycer.name()).to.equal('PaycerToken')
    expect(await this.paycer.symbol()).to.equal('PCR')
    expect(await this.paycer.decimals()).to.equal(18)
    expect(await this.paycer.totalSupply()).to.equal(this.initialSupply)
    expect(await this.paycer.cap()).to.equal(this.totalSupply)
    expect(await this.paycer.getChainId()).to.equal(31337)
  })

  it('should allow owner to mint token', async function () {
    await this.paycer.mint(this.owner.address, 1000)
    await this.paycer.mint(this.address1.address, 1000)

    const address1 = await this.paycer.connect(this.address1);
    await expect(address1.mint(this.address2.address, 1000)).to.be.revertedWith('Ownable: caller is not the owner')

    const totalSupply = await this.paycer.totalSupply()
    const balanceOfOwner = await this.paycer.balanceOf(this.owner.address)
    const balanceOfAddress1 = await this.paycer.balanceOf(this.address1.address)
    const balanceOfAddress2 = await this.paycer.balanceOf(this.address2.address)

    expect(totalSupply).to.equal(1002000)
    expect(balanceOfOwner).to.equal(1001000)
    expect(balanceOfAddress1).to.equal(1000)
    expect(balanceOfAddress2).to.equal(0)
  })

  it('should not allow others to mint token', async function () {
    const address1 = await this.paycer.connect(this.address1)
    const address2 = await this.paycer.connect(this.address2)

    await expect(address1.mint(this.address1.address, 1000)).to.be.revertedWith('Ownable: caller is not the owner')
    await expect(address2.mint(this.address2.address, 1000)).to.be.revertedWith('Ownable: caller is not the owner')
    await expect(address1.mint(this.address2.address, 1000)).to.be.revertedWith('Ownable: caller is not the owner')
    await expect(address2.mint(this.address1.address, 1000)).to.be.revertedWith('Ownable: caller is not the owner')
  })
  
  it('should not allow owner to mint more tokens if supply is exceeded', async function () {
    const owner = await this.paycer.connect(this.owner)
    await expect(owner.mint(owner.address, 800000000)).to.be.revertedWith('revert ERC20Capped: cap exceeded')
  })

  it('Should transfer tokens between accounts', async function () {
    const owner = await this.paycer.connect(this.owner)

    await owner.transfer(this.address1.address, 100)
    const balanceOfAddress1 = await this.paycer.balanceOf(this.address1.address)
    expect((balanceOfAddress1).toNumber()).to.equal(100)

    await owner.transfer(this.address2.address, 100)
    const balanceOfAddress2 = await this.paycer.balanceOf(this.address2.address)
    expect((balanceOfAddress2).toNumber()).to.equal(100)
  })

  it('should not send tokens if the balance has not enougth tokens', async function () {
    const owner = await this.paycer.connect(this.owner)
    const address2 = await this.paycer.connect(this.address2)

    await expect(owner.transfer(this.address1.address, 10000000)).to.be.revertedWith('ERC20: transfer amount exceeds balance')
    await expect(address2.transfer(this.owner.address, 1)).to.be.revertedWith('ERC20: transfer amount exceeds balance')
  })
})*/