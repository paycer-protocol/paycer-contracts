// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ILoyaltyProgram {
    enum LoyaltyTier { NONE, ASSOCIATE, SENIOR, MANAGER, PARTNER }

    function loyaltyTierOf(address account) external view returns (LoyaltyTier);

    function baseRewardRateOf(address account) external view returns (uint256);

    function interestRateOf(address account) external view returns (uint256);

    function discountRateOf(address account) external view returns (uint256);
}