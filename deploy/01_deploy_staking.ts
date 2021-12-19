import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';


const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre
  const { deploy } = deployments
  const { deployer, rewardTreasury } = await getNamedAccounts()
  
  const paycerToken = await deployments.get('PaycerToken');

  const deployedStaking = await deploy('Staking', {
    log: true,
    from: deployer,
    args: [
      paycerToken.address, 
      paycerToken.address 
    ],
  })

  const stakingContract = await ethers.getContractAt(
    deployedStaking.abi,
    deployedStaking.address
  )

  await (await stakingContract.setBaseAPY(1000 /* 10% */)).wait()
  await (await stakingContract.setRewardTreasury(rewardTreasury)).wait()
}

export default func
func.tags = ['PaycerToken', 'Staking']
