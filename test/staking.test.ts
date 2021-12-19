/* eslint-disable no-await-in-loop */
import { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";
import chai from 'chai';
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { BigNumber } from "ethers";
import { PaycerToken, Staking } from "../typechain";
import { setNextBlockTimestamp, getLatestBlockTimestamp, mineBlock, advanceTime, duration, getBigNumber } from "../helper/utils";
import { deployContract } from "../helper/deployer";

chai.use(solidity);
const { expect } = chai;

describe('Staking Pool', () => {
  const totalAmount = getBigNumber("2000000000");
  const totalRewardAmount = getBigNumber("250000000");
  const OneYear = duration.years(1);
  const baseAPY = 1000; // 10%

  let staking: Staking;
  let lpToken: PaycerToken;
  let rewardToken: PaycerToken;

  let deployer: SignerWithAddress;
  let bob: SignerWithAddress;
  let alice: SignerWithAddress;
  let rewardTreasury: SignerWithAddress;

  let apyAccuracy: BigNumber;

  before(async () => {
    [deployer, bob, alice, rewardTreasury] = await ethers.getSigners();
  });

  beforeEach(async () => {
    lpToken = <PaycerToken>await deployContract("PaycerToken", totalAmount, totalAmount);
    rewardToken = lpToken;
    staking = <Staking>await deployContract(
      "Staking", 
      rewardToken.address, 
      lpToken.address, 
      deployer.address, 
      baseAPY
    );

    apyAccuracy = await staking.APY_ACCURACY();

    await rewardToken.transfer(rewardTreasury.address, totalRewardAmount);
    await rewardToken.approve(staking.address, ethers.constants.MaxUint256);

    await lpToken.transfer(bob.address, totalAmount.div(5));
    await lpToken.transfer(alice.address, totalAmount.div(5));

    await lpToken.approve(staking.address, ethers.constants.MaxUint256);
    await lpToken.connect(bob).approve(staking.address, ethers.constants.MaxUint256);
    await lpToken.connect(alice).approve(staking.address, ethers.constants.MaxUint256);
  });

  describe("Set base apy", () => {
    const newAPY = 2000;

    it("Only owner can do these operation", async () => {
      await expect(staking.connect(bob).setBaseAPY(newAPY)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("It correctly updates information", async () => {
      await staking.setBaseAPY(newAPY);
      expect(await staking.baseAPY()).to.be.equal(newAPY);
    });
  });

  describe("Reward APY", function() {
    it("<5000", async function () {
      await staking.deposit(getBigNumber(1), alice.address);
      await staking.deposit(getBigNumber(4998), alice.address);
      expect(await staking.rewardAPY(alice.address)).to.be.equal(0);
    });

    it("5000 ~ 15000", async function () {
      await staking.deposit(getBigNumber(5000), alice.address);
      expect(await staking.rewardAPY(alice.address)).to.be.equal(baseAPY / 2);
      await staking.deposit(getBigNumber(5000), alice.address);
      expect(await staking.rewardAPY(alice.address)).to.be.equal(baseAPY / 2);
      await staking.deposit(getBigNumber(4999), alice.address);
      expect(await staking.rewardAPY(alice.address)).to.be.equal(baseAPY / 2);
    });

    it("15000 ~ 35000", async function () {
      await staking.deposit(getBigNumber(15000), alice.address);
      expect(await staking.rewardAPY(alice.address)).to.be.equal(baseAPY);
      await staking.deposit(getBigNumber(19999), alice.address);
      expect(await staking.rewardAPY(alice.address)).to.be.equal(baseAPY);
    });

    it("35000 ~ 100000", async function () {
      await staking.deposit(getBigNumber(35000), alice.address);
      expect(await staking.rewardAPY(alice.address)).to.be.equal(baseAPY * 3 / 2);
    });

    it("100000 ~", async function () {
      await staking.deposit(getBigNumber(100000), alice.address);
      expect(await staking.rewardAPY(alice.address)).to.be.equal(baseAPY * 2);
    });
  });

  describe("Deposit", () => {
    it("Deposit 0 amount", async () => {
      await expect(staking.deposit(getBigNumber(0), bob.address))
        .to.emit(staking, "Deposit")
        .withArgs(deployer.address, 0, bob.address);
    });

    it("Staking amount increases", async () => {
      const stakeAmount1 = ethers.utils.parseUnits("10", 18);
      const stakeAmount2 = ethers.utils.parseUnits("4", 18);

      await staking.deposit(stakeAmount1, bob.address);

      // user info
      const userInfo1 = await staking.userInfo(bob.address);
      expect(userInfo1.amount).to.be.equal(stakeAmount1);

      await staking.deposit(stakeAmount2, bob.address);

      // user info
      const userInfo2 = await staking.userInfo(bob.address);
      expect(userInfo2.amount).to.be.equal(stakeAmount1.add(stakeAmount2));
    });
  });

  describe("PendingReward", function() {
    it("PendingReward should equal ExpectedReward", async function () {
      const amount = getBigNumber(50000);
      const log = await staking.deposit(amount, alice.address)
      const apy = await staking.rewardAPY(alice.address);
      await advanceTime(315360);
      const log2 = await staking.update(alice.address);
      const timestamp2 = (await ethers.provider.getBlock(log2.blockNumber!)).timestamp
      const timestamp = (await ethers.provider.getBlock(log.blockNumber!)).timestamp
      const expectedReward = amount.mul(timestamp2 - timestamp).mul(apy).div(apyAccuracy).div(OneYear)
      expect(await staking.pendingReward(alice.address)).to.be.equal(expectedReward)
    });

    it("APY is changed after staking more", async function () {
      const amount = getBigNumber(10000);
      const amount2 = getBigNumber(10000);
      const amount3 = getBigNumber(20000);
      const log = await staking.deposit(amount, alice.address)
      const apy = await staking.rewardAPY(alice.address);
      await advanceTime(315360);
      const log2 = await staking.deposit(amount2, alice.address)
      const apy2 = await staking.rewardAPY(alice.address);
      await advanceTime(315360);
      const log3 = await staking.deposit(amount3, alice.address)
      const apy3 = await staking.rewardAPY(alice.address);
      await advanceTime(315360);
      const log4 = await staking.update(alice.address)
      
      const timestamp = (await ethers.provider.getBlock(log.blockNumber!)).timestamp
      const timestamp2 = (await ethers.provider.getBlock(log2.blockNumber!)).timestamp
      const timestamp3 = (await ethers.provider.getBlock(log3.blockNumber!)).timestamp
      const timestamp4 = (await ethers.provider.getBlock(log4.blockNumber!)).timestamp

      const expectedReward = amount.mul(timestamp2 - timestamp).mul(apy).div(apyAccuracy).div(OneYear)
      const expectedReward2 = amount.add(amount2).mul(timestamp3 - timestamp2).mul(apy2).div(apyAccuracy).div(OneYear)
      const expectedReward3 = amount.add(amount2).add(amount3).mul(timestamp4 - timestamp3).mul(apy3).div(apyAccuracy).div(OneYear)
      const totalRewards = expectedReward.add(expectedReward2).add(expectedReward3);
      expect(await staking.pendingReward(alice.address)).to.be.equal(totalRewards);
    });
  })

  describe("Update", () => {
    it("LogUpdatePool event is emitted", async () => {
      await staking.deposit(getBigNumber(1), alice.address);
      await expect(staking.update(alice.address))
        .to.emit(staking, "LogUpdate")
        .withArgs(alice.address, (await staking.userInfo(alice.address)).lastRewardTime, (await staking.userInfo(alice.address)).amount, (await staking.userInfo(alice.address)).accRewardPerShare);
    });
  });

  describe("Claim", () => {
    it("Should give back the correct amount of reward", async () => {
      const amount = getBigNumber(50000);
      let log = await staking.deposit(amount, alice.address)
      const apy = await staking.rewardAPY(alice.address);
      await advanceTime(315360);
      const aliceBalanceBefore = await rewardToken.balanceOf(alice.address);
      let log2 = await staking.connect(alice).claim(alice.address);
      const aliceBalanceAfter = await rewardToken.balanceOf(alice.address);
      let timestamp2 = (await ethers.provider.getBlock(log2.blockNumber!)).timestamp;
      let timestamp = (await ethers.provider.getBlock(log.blockNumber!)).timestamp;
      const expectedReward = amount.mul(timestamp2 - timestamp).mul(apy).div(apyAccuracy).div(OneYear)

      expect(aliceBalanceAfter.sub(aliceBalanceBefore)).to.be.equal(expectedReward);
      expect((await staking.userInfo(alice.address)).rewardDebt).to.be.equal(expectedReward);
      expect(await staking.pendingReward(alice.address)).to.be.equal(0);
    });

    it("Claim with empty user balance", async () => {
      await staking.connect(alice).claim(alice.address);
    })
  });

  describe("Withdraw", () => {
    it("Should give back the correct amount of lp token and claim rewards(withdraw whole amount)", async () => {
      const amount = getBigNumber(150000);
      let log = await staking.deposit(amount, alice.address)
      const apy = await staking.rewardAPY(alice.address);
      await advanceTime(315360);

      const balance0 = await lpToken.balanceOf(alice.address);
      const reward0 = await rewardToken.balanceOf(alice.address);
      let log2 = await staking.connect(alice).withdraw(amount, alice.address);
      const balance1 = await lpToken.balanceOf(alice.address);
      const reward1 = await rewardToken.balanceOf(alice.address);

      let timestamp2 = (await ethers.provider.getBlock(log2.blockNumber!)).timestamp;
      let timestamp = (await ethers.provider.getBlock(log.blockNumber!)).timestamp;
      const expectedReward = amount.mul(timestamp2 - timestamp).mul(apy).div(apyAccuracy).div(OneYear)

      if (rewardToken.address == lpToken.address) {
        expect(expectedReward.add(amount)).to.be.equal(balance1.sub(balance0));
      } else {
        expect(amount).to.be.equal(balance1.sub(balance0));
        expect(expectedReward).to.be.equal(reward1.sub(reward0));
      }

      // remainging reward should be zero
      expect(await staking.pendingReward(alice.address)).to.be.equal(0);
      // remaing debt should be zero
      expect((await staking.userInfo(alice.address)).rewardDebt).to.be.equal(0);
    });

    it("Withraw 0", async () => {
      await expect(staking.connect(alice).withdraw(0, bob.address))
        .to.emit(staking, "Withdraw")
        .withArgs(alice.address, 0, bob.address);
    })
  });

  describe("EmergencyWithdraw", () => {
    it("Should emit event EmergencyWithdraw", async () => {
      await staking.deposit(getBigNumber(1), bob.address);
      await advanceTime(315360);
      await expect(staking.connect(bob).emergencyWithdraw(bob.address))
        .to.emit(staking, "EmergencyWithdraw")
        .withArgs(bob.address, getBigNumber(1), bob.address);
    });
  });

  describe("Reward Treasury", () => {
    it("setRewardTreasury - Security/Work", async () => {
      await expect(staking.connect(bob).setRewardTreasury(rewardTreasury.address)).to.be.revertedWith("Ownable: caller is not the owner");
      await staking.setRewardTreasury(rewardTreasury.address);
      expect(await staking.rewardTreasury()).to.be.equal(rewardTreasury.address);
    });

    it("can only spend aproved amount", async () => {
      await rewardToken.connect(rewardTreasury).approve(staking.address, 0);
      await staking.setRewardTreasury(rewardTreasury.address);
      let rewardInfo = await staking.availableReward();
      expect(rewardInfo.rewardInTreasury).to.be.equal(await rewardToken.balanceOf(rewardTreasury.address));
      expect(rewardInfo.rewardAllowedForThisPool).to.be.equal(0);
      
      await rewardToken.connect(rewardTreasury).approve(staking.address, totalRewardAmount);
      expect(await (await staking.availableReward()).rewardAllowedForThisPool).to.be.equal(totalRewardAmount);      
    });

    it("should fail if allowed amount is small", async () => {
      await rewardToken.connect(rewardTreasury).approve(staking.address, 0);
      await staking.setRewardTreasury(rewardTreasury.address);

      await staking.deposit(getBigNumber(50000), alice.address)
      await advanceTime(315360);
      await expect(staking.connect(alice).claim(alice.address)).to.be.revertedWith("ERC20: transfer amount exceeds allowance");

      let rewardAmount = await staking.pendingReward(alice.address);
      await rewardToken.connect(rewardTreasury).approve(staking.address, rewardAmount.sub(1));
      await expect(staking.connect(alice).claim(alice.address)).to.be.revertedWith("ERC20: transfer amount exceeds allowance");

      await rewardToken.connect(rewardTreasury).approve(staking.address, totalRewardAmount);
      await staking.connect(alice).claim(alice.address);
    });
  });

  describe("Renoucne Ownership", () => {
    it("Should revert when call renoucne ownership", async () => {
      await expect(staking.connect(deployer).renounceOwnership()).to.be.reverted;
    });
  });
});
