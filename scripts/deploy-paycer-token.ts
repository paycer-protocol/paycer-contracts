import hre from 'hardhat'
import { BigNumber } from 'ethers'

const INITIAL_SUPPLY = '100000000000000000000000000'
const TOTAL_SUPPLY   = '750000000000000000000000000'

async function main() {
  const PaycerToken = await hre.ethers.getContractFactory('PaycerToken')
  const paycer = await PaycerToken.deploy(INITIAL_SUPPLY, TOTAL_SUPPLY)

  await paycer.deployed()

  console.log('PaycerToken deployed to:', paycer.address)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
