import hre, { ethers } from "hardhat";
import { Erc20 } from "../typechain";

export async function impersonateAccount(account: string) {
  await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [account]}
  );
}

export async function stopImpersonatingAccount(account: string) {
  await hre.network.provider.request({
      method: "hardhat_stopImpersonatingAccount",
      params: [account]}
  );
}

export async function impersonateForToken(address: string, whale: string, receiver: any, amount: any) {
  const token = <Erc20>await ethers.getContractAt("ERC20", address);
  const symbol = await token.symbol();
  const decimals = await token.decimals();
  console.log(`Impersonating for ${symbol}`);
  await receiver.sendTransaction({
    to: whale,
    value: ethers.utils.parseEther("1.0")
  });

  await impersonateAccount(whale);
  const signedHolder = await ethers.provider.getSigner(whale);
  await token.connect(signedHolder).transfer(receiver.address, ethers.utils.parseUnits(amount, decimals));
  await stopImpersonatingAccount(whale);
}

async function main() {
  const [deployer] = await ethers.getSigners();
  // USDT
  await impersonateForToken("0xc2132d05d31c914a87c6611c10748aeb04b58e8f", "0x0d0707963952f2fba59dd06f2b425ace40b492fe", deployer.address, "10000");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
