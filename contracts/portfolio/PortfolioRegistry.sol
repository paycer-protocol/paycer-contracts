// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/utils/math/Math.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '../interfaces/IPortfolioRegistry.sol';
import 'hardhat/console.sol';


contract PortfolioRegistry is IPortfolioRegistry, ReentrancyGuard, Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /* ========== STATE VARIABLES ========== */

    mapping(address => uint256) private _portfolios;


    /* ========== VIEWS ========== */

    function portfolioBalanceOf(address account) external override view returns (uint256) {
        return _portfolios[account];
    }
}