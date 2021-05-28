import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';


const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts();

  const initialSupply = 1000000
  const totalSupply   = 750000000

  await deploy('PaycerToken', {
    from: deployer,
    args: [initialSupply, totalSupply],
    log: true,
  })
}

export default func
func.tags = ['PaycerToken']
