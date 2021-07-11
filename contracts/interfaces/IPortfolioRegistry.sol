// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IPortfolioRegistry {
    function portfolioBalanceOf(address account) external view returns (uint256);
}