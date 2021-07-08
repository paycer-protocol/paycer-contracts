import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';


const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments

  const { owner } = await getNamedAccounts();

  const totalSupply = 750000000

  await deploy('PaycerToken', {
    from: owner,
    args: [totalSupply],
    log: true,
  })
}

export default func
func.tags = ['PaycerToken']
