import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';


const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments, getNamedAccounts } = hre
  const { deploy } = deployments

  const { owner } = await getNamedAccounts()
  const paycerToken = await ethers.getContract('PaycerToken')
  

  const rewardTreasury = await deploy('RewardTreasury', {
    from: owner,
    args: [paycerToken.address],
    log: true,
  })

  const loyaltyProgram = await deploy('LoyaltyProgram', {
    from: owner,
    args: [paycerToken.address],
    log: true,
  })

  const stakingRewards = await deploy('StakingRewards', {
    from: owner,
    args: [
      paycerToken.address,
      rewardTreasury.address,
      loyaltyProgram.address
    ],
    log: true,
  })

  const stakedPaycerToken = await deploy('StakedPaycerToken', {
    from: owner,
    args: [
      paycerToken.address,
      rewardTreasury.address,
      loyaltyProgram.address
    ],
    log: true,
  })


  const treasuryContract = await ethers.getContract('RewardTreasury')
  if (await treasuryContract.owner() !== stakingRewards.address) {
    // console.log('Transfer reward treasury ownership to staking rewards contract')
    // await (await treasuryContract.transferOwnership(stakingRewards.address)).wait()
  }

  if (await treasuryContract.owner() !== stakedPaycerToken.address) {
    console.log('Transfer reward treasury ownership to staked paycer token contract')
    await (await treasuryContract.transferOwnership(stakedPaycerToken.address)).wait()
  }
}

export default func
func.tags = ['PaycerToken', 'StakingRewards', 'StakedPaycerToken', 'LoyaltyProgram']
