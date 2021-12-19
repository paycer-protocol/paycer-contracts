import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';


const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre
  const { deploy } = deployments
  const { deployer, rewardTreasury } = await getNamedAccounts()
  
  const paycerToken = await ethers.getContract('PaycerToken')


  await deploy('Staking', {
    from: deployer,
    args: [
      paycerToken.address, 
      paycerToken.address // TODO: needs to clearify
    ],
    log: true,
  })

  // TODO: here an execption is thrown. Anyone an idea?
  const stakingContract = await ethers.getContract('Staking')
  await (await stakingContract.setBaseAPY(1000 /* 10% */)).wait()
  await (await stakingContract.setRewardTreasury(rewardTreasury)).wait()
}

export default func
func.tags = ['PaycerToken', 'Staking']
