import hre from 'hardhat'
import ethers, { BigNumber } from 'ethers'

async function main() {
  const signers = await hre.ethers.getSigners()
  const owner = signers[0]

  const PaycerToken = await hre.ethers.getContractFactory('PaycerToken')
  const paycer = await PaycerToken.deploy(1000)

  await paycer.deployed()

  console.log('PaycerToken deployed to:', paycer.address)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
