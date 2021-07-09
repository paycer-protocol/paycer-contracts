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


contract StakingRewards is ReentrancyGuard, Pausable, Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /* ========== STATE VARIABLES ========== */

    IERC20 private _baseToken;
    IRewardTreasury private _rewardTreasury;
    uint256 private _totalStaked;

    mapping(address => uint256) private _stakedBalances;
    mapping(address => uint256) private _rewardBalances;
    mapping(address => uint256) private _lockPeriods;
    mapping(address => uint256) private _lastStakeTimes;
    mapping(address => uint256) private _lastWithdrawTimes;
    mapping(address => uint256) private _lastClaimTimes;


    /* ========== EVENTS ========== */

    event Staked(address indexed account, uint256 amount, uint256 lockPeriod);
    event Withdrawn(address indexed account, uint256 amount);
    event Claimed(address indexed account, uint256 amount);


    /* ========== CONSTRUCTOR ========== */

    constructor(address baseToken, address rewardTreasury) {
        _baseToken = IERC20(baseToken);
        _rewardTreasury = IRewardTreasury(rewardTreasury);
    }


    /* ========== VIEWS ========== */

    function treasurySupply() public view virtual returns (uint256) {
        return _baseToken.balanceOf(address(_rewardTreasury));
    }

    function totalStakedBalances() public view virtual returns (uint256) {
        return _totalStaked;
    }

    function stakedBalanceOf(address account) public view virtual returns (uint256) {
        return _stakedBalances[account];
    }

    function lastStakeTimeOf(address account) public view virtual returns (uint256) {
        return _lastStakeTimes[account];
    }

    function lastWithdrawTime(address account) public view virtual returns (uint256) {
        return _lastWithdrawTimes[account];
    }

   
    function rewardBalanceOf(address account) public view virtual returns (uint256)  {
        return _rewardBalances[account];
    }


    /* ========== MUTATIVE FUNCTIONS ========== */
    
    function stake(uint256 amount, uint256 lockPeriod) external nonReentrant whenNotPaused calculateReward(msg.sender) {
        require(amount > 0, 'Amount must be greater than 0');
        require(_baseToken.balanceOf(msg.sender) >= amount, 'Not enough tokens in the wallet');

        // add up total staked tokens
        _totalStaked = _totalStaked.add(amount);

        // add account to staked balances
        _stakedBalances[msg.sender] = _stakedBalances[msg.sender].add(amount);

        // add lock period in days
        _lockPeriods[msg.sender] = _lockPeriods[msg.sender].add(lockPeriod);

        // lock tokens in the contract
        _baseToken.safeTransferFrom(msg.sender, address(this), amount);

        // add timestamp to account
        _lastStakeTimes[msg.sender] = block.timestamp;

        emit Staked(msg.sender, amount, lockPeriod);
    }

    function withdraw(uint256 amount) external nonReentrant whenNotPaused calculateReward(msg.sender) {
        require(amount > 0, 'Amount must be greater than 0');
        require(stakedBalanceOf(msg.sender) >= amount, 'Amount must be greater or equal to staked amount');


        if (_lockPeriods[msg.sender] > 0) {
            uint256 lastStakeTime = _lastStakeTimes[msg.sender];
            uint256 releaseTime = lastStakeTime + _lockPeriods[msg.sender] * 1 days;

            require(block.timestamp >= releaseTime, 'Lock period not exceeded');
        }

        // subtract total staked tokens
        _totalStaked = _totalStaked.sub(amount);

        // subtract amount from staked balances
        _stakedBalances[msg.sender] = _stakedBalances[msg.sender].sub(amount);

        // approve transfer amount to perform transfer
        _baseToken.approve(address(this), amount);

        // release tokens from the contract
        _baseToken.safeTransferFrom(address(this), msg.sender, amount);

        // add timestamp to account
        _lastWithdrawTimes[msg.sender] = block.timestamp;

        emit Withdrawn(msg.sender, amount);
    }


    function claim() external nonReentrant whenNotPaused calculateReward(msg.sender) {
        uint256 rewardAmount = _rewardBalances[msg.sender];
        require(rewardAmount > 0, 'Amount must be greater than 0');
        require(treasurySupply() >= rewardAmount, 'Not enough tokens in the treasury');

        // reset reward from reward balances
        _rewardBalances[msg.sender] = 0;

        // transfer tokens from reward treasury to beneficial
        _rewardTreasury.claim(msg.sender, rewardAmount);

        // add timestamp to account
        _lastClaimTimes[msg.sender] = block.timestamp;

        emit Claimed(msg.sender, rewardAmount);
    }


    /* ========== MODIFIERS ========== */

    modifier calculateReward(address account) {
        _rewardBalances[account] = rewardBalanceOf(account);
        _;
    }
}