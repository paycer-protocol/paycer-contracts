// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/utils/math/Math.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import './interfaces/IRewardTreasury.sol';
import './interfaces/IPortfolioRegistry.sol';
import './interfaces/ILoyaltyProgram.sol';
import 'hardhat/console.sol';


contract LoyaltyProgram is ILoyaltyProgram {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;


    /* ========== STATE VARIABLES ========== */

    IERC20 private _baseToken;


    /* ========== CONSTRUCTOR ========== */

    constructor(address baseToken) {
        _baseToken = IERC20(baseToken);
    }


    /* ========== VIEWS ========== */


    function loyaltyTierOf(address account) external override view returns (LoyaltyTier) {
        return _loyaltyTierOf(account);
    }

    function _loyaltyTierOf(address account) internal view returns (LoyaltyTier) {
        uint256 tokenBalance = _baseToken.balanceOf(account);

        if (tokenBalance >= 100000) {
            return LoyaltyTier.PARTNER;
        } else if (tokenBalance >= 35000) {
            return LoyaltyTier.MANAGER;
        } else if (tokenBalance >= 15000) {
            return LoyaltyTier.SENIOR;
        } else if (tokenBalance >= 5000) {
            return LoyaltyTier.ASSOCIATE;
        }

        return LoyaltyTier.NONE;
    }

    function baseRewardRateOf(address account) external override view returns (uint256) {
        return 15;
    }


    function interestRateOf(address account) external override view returns (uint256) {
        LoyaltyTier tier = _loyaltyTierOf(account);

        if (tier == LoyaltyTier.PARTNER) {
            return 450;
        } else if (tier == LoyaltyTier.MANAGER) {
            return 350;
        } else if (tier == LoyaltyTier.SENIOR) {
            return 250;
        } else if (tier == LoyaltyTier.ASSOCIATE) {
            return 150;
        }

        return 0;
    }

    function discountRateOf(address account) external override view returns (uint256) {
        LoyaltyTier tier = _loyaltyTierOf(account);

        if (tier == LoyaltyTier.PARTNER) {
            return 2000;
        } else if (tier == LoyaltyTier.MANAGER) {
            return 1500;
        } else if (tier == LoyaltyTier.SENIOR) {
            return 1250;
        } else if (tier == LoyaltyTier.ASSOCIATE) {
            return 750;
        }

        return 0;
    }
}