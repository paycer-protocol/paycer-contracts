import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import IAddressList from '../artifacts/sol-address-list/contracts/interfaces/IAddressList.sol/IAddressList.json';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts();

  // create Paycer controller
  const controller = await deploy('Controller', {
    from: deployer,
    args: [],
    log: true,
  });
  const controllerContract = await hre.ethers.getContractAt(controller.abi, controller.address);

  // create PUSDC pool and add to Paycer controller
  const pUsdc = await deploy('PUSDC', {
    from: deployer,
    args: [controller.address],
    log: true,
  });
  
  const poolsContract = await hre.ethers.getContractAt(IAddressList.abi, await controllerContract.pools());
  const isAlreadyContained = await poolsContract.contains(pUsdc.address);
  if(!isAlreadyContained) {
    await controllerContract.addPool(pUsdc.address);
  }

  // create USDC compound strategy and use it for the PUSDC pool
  const usdcCompoundStrategy = await deploy('CompoundStrategyUSDC', {
    from: deployer,
    args: [controller.address, pUsdc.address],
    log: true,
  });
  await controllerContract.updateStrategy(pUsdc.address, usdcCompoundStrategy.address);
}

export default func
func.tags = ['Strategies']
