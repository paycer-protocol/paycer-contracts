// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/utils/math/Math.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '../interfaces/IRewardTreasury.sol';
import 'hardhat/console.sol';


contract RewardTreasury is IRewardTreasury, ReentrancyGuard, Pausable, Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /* ========== STATE VARIABLES ========== */

    IERC20 private _baseToken;


    /* ========== EVENTS ========== */

    event Claimed(address indexed account, uint256 amount);


    /* ========== CONSTRUCTOR ========== */

    constructor(address baseToken) {
        _baseToken = IERC20(baseToken);
    }


    /* ========== MUTATIVE FUNCTIONS ========== */

    function claim(address beneficial, uint256 amount) external override onlyOwner {
        require(amount > 0, 'Amount must be greater than 0');
        require(_baseToken.balanceOf(address(this)) >= amount, 'Not enough tokens in the treasury');

        // approve transfer amount to perform transfer
        _baseToken.approve(address(this), amount);

        // transfer tokens t beneficial
        _baseToken.safeTransferFrom(address(this), beneficial, amount);

        emit Claimed(beneficial, amount);
    }
}