// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IRewardTreasury {
    function claim(address beneficial, uint256 amount) external;
}