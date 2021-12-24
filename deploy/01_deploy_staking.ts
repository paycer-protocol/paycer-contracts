import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';


const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre
  const { deploy } = deployments
  const { deployer, rewardTreasury } = await getNamedAccounts()
  
  const paycerToken = await deployments.get('PaycerToken');

  await deploy('Staking', {
    log: true,
    from: deployer,
    args: [
      paycerToken.address, 
      paycerToken.address,
      rewardTreasury,
      1000
    ],
  })
}

export default func
func.tags = ['Staking']
