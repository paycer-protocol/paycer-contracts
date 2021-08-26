// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/utils/math/Math.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '../interfaces/IRewardTreasury.sol';
import '../interfaces/ILoyaltyProgram.sol';
import 'hardhat/console.sol';


contract StakedPaycerToken is ERC20, ReentrancyGuard, Pausable, Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /* ========== STATE VARIABLES ========== */

    IERC20 private _baseToken;
    IRewardTreasury private _rewardTreasury;
    ILoyaltyProgram private _loyaltyProgram;

    /* ========== EVENTS ========== */

    event Staked(address indexed account, uint256 amount);
    event Withdrawn(address indexed account, uint256 amount);
    event Claimed(address indexed account, uint256 amount);

    /* ========== CONSTRUCTOR ========== */

    constructor(
        address baseToken, 
        address rewardTreasury, 
        address loyaltyProgram) 
        ERC20('StakedPaycerToken', 'sPCR') 
    {
        _baseToken = IERC20(baseToken);
        _rewardTreasury = IRewardTreasury(rewardTreasury);
        _loyaltyProgram = ILoyaltyProgram(loyaltyProgram);
    }

    /* ========== VIEWS ========== */

    function getChainId() external view returns (uint256) {
        uint256 chainId;
        
        assembly {
            chainId := chainid()
        }

        return chainId;
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    function stake(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, 'Amount must be greater than 0');
        require(_baseToken.balanceOf(msg.sender) >= amount, 'Not enough tokens in the wallet');

        uint256 totalBalance = _baseToken.balanceOf(address(this));
        uint256 totalShares = totalSupply();

        if (totalShares == 0 || totalBalance == 0) {
            _mint(msg.sender, amount);
        } else {
            uint256 stakeAmount = amount.mul(totalShares).div(totalBalance);
            _mint(msg.sender, stakeAmount);
        }

        _baseToken.safeTransferFrom(msg.sender, address(this), amount);

        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, 'Amount must be greater than 0');

        uint256 totalShares = totalSupply();
        uint256 totalBalance = _baseToken.balanceOf(address(this));
        uint256 withdrawAmount = amount.mul(totalBalance).div(totalShares);
        require(withdrawAmount > 0, 'Nothing to withdraw');

        _burn(msg.sender, amount);
        _baseToken.safeTransferFrom(address(this), msg.sender, withdrawAmount);

        emit Withdrawn(msg.sender, amount);
    }
}