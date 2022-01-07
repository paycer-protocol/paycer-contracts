import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import IAddressList from '../artifacts/sol-address-list/contracts/interfaces/IAddressList.sol/IAddressList.json';
import constants from '../helper/constants';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, getChainId } = hre
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  console.log(chainId);

  // create Paycer controller
  const controller = await deploy('Controller', {
    from: deployer,
    args: [
      constants[chainId].addressListFactory,
      constants[chainId].uniswapV2Router
    ],
    log: true,
  });
  const controllerContract = await hre.ethers.getContractAt(controller.abi, controller.address);

  // create PUSDC pool and add to Paycer controller
  const pUsdc = await deploy('PUSDC', {
    from: deployer,
    args: [
      constants[chainId].USDC,
      constants[chainId].WETH,
      constants[chainId].addressListFactory,
      controller.address
    ],
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
    args: [
      controller.address,
      pUsdc.address,
      constants[chainId].compUSDC,
      constants[chainId].COMP,
      constants[chainId].comptroller
    ],
    log: true,
  });
  await controllerContract.updateStrategy(pUsdc.address, usdcCompoundStrategy.address);
  await controllerContract.setStrategyInfo(pUsdc.address, constants[chainId].swapManager, constants[chainId].WETH);
}

export default func
func.tags = ['Strategies']
