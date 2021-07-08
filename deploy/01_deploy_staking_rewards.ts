import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';


const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments, getNamedAccounts } = hre
  const { deploy } = deployments

  const { owner } = await getNamedAccounts()
  const PaycerToken = await ethers.getContract('PaycerToken')

  const rewardTreasury = await deploy('RewardTreasury', {
    from: owner,
    args: [PaycerToken.address],
    log: true,
  })

  const stakingRewards = await deploy('StakingRewards', {
    from: owner,
    args: [PaycerToken.address, rewardTreasury.address],
    log: true,
  })


  const treasuryContract = await ethers.getContract('RewardTreasury')

  if (await treasuryContract.owner() !== stakingRewards.address) {
    console.log('Transfer reward treasury ownership to staking rewards contract')
    await (await treasuryContract.transferOwnership(stakingRewards.address)).wait()
  }
}

export default func
func.tags = ['PaycerToken', 'StakingRewards']
