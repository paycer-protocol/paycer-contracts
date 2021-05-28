import hre from 'hardhat'

async function main() {
  const PaycerToken = await hre.ethers.getContractFactory('PaycerToken')
  const paycer = await PaycerToken.deploy(1000 * 10^18)

  await paycer.deployed()

  console.log('PaycerToken deployed to:', paycer.address)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
