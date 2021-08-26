// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/utils/math/Math.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '../interfaces/IRewardTreasury.sol';
import '../interfaces/ILoyaltyProgram.sol';
import 'hardhat/console.sol';


contract StakingRewards is ReentrancyGuard, Pausable, Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;


    /* ========== STATE VARIABLES ========== */

    IERC20 private _baseToken;
    IRewardTreasury private _rewardTreasury;
    ILoyaltyProgram private _loyaltyProgram;

    uint256 private _totalStaked;
    uint256 private _minLockDays = 2;

    mapping(address => uint256) private _stakedBalances;
    mapping(address => uint256) private _rewardBalances;
    mapping(address => uint256) private _lastStakeTimes;
    mapping(address => uint256) private _lastWithdrawTimes;
    mapping(address => uint256) private _lastClaimTimes;


    /* ========== EVENTS ========== */

    event Staked(address indexed account, uint256 amount);
    event Withdrawn(address indexed account, uint256 amount);
    event Claimed(address indexed account, uint256 amount);


    /* ========== CONSTRUCTOR ========== */

    constructor(address baseToken, address rewardTreasury, address loyaltyProgram) {
        _baseToken = IERC20(baseToken);
        _rewardTreasury = IRewardTreasury(rewardTreasury);
        _loyaltyProgram = ILoyaltyProgram(loyaltyProgram);
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

    function lastClaimedOf(address account) public view virtual returns (uint256) {
        return 10;
    }

    function totalClaimedOf(address account) public view virtual returns (uint256) {
        return 1000;
    }

    function lastStakeTimeOf(address account) public view virtual returns (uint256) {
        return _lastStakeTimes[account];
    }

    function lastWithdrawTimeOf(address account) public view virtual returns (uint256) {
        return _lastWithdrawTimes[account];
    }

    function rewardRateOf(address account) public view virtual returns (uint256) {
        return  15;
    }
   
    function rewardBalanceOf(address account) public view virtual returns (uint256)  {
        uint256 rewardRate = _loyaltyProgram.baseRewardRateOf(account);
        uint256 stakedBalance = stakedBalanceOf(account);

        uint256 lastClaimOrStakeTime = _lastClaimTimes[account] > 0 
            ? _lastClaimTimes[account] 
            : _lastStakeTimes[account];
        if (lastClaimOrStakeTime == 0) {
            return 0;
        }

        uint256 stakedHours = block.timestamp.sub(lastClaimOrStakeTime).div(365 days);
        if (stakedHours == 0) {
            return 0;
        }

        uint256 ratePerHour = rewardRate.mul(100000).div(365 days);
        uint256 rewardBalance = stakedHours * (stakedBalance * ratePerHour / 100);

        return rewardBalance;
    }


    /* ========== MUTATIVE FUNCTIONS ========== */
    
    function stake(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, 'Amount must be greater than 0');
        require(_baseToken.balanceOf(msg.sender) >= amount, 'Not enough tokens in the wallet');

        _totalStaked = _totalStaked.add(amount);

        _stakedBalances[msg.sender] = _stakedBalances[msg.sender].add(amount);

        _baseToken.safeTransferFrom(msg.sender, address(this), amount);

        _lastStakeTimes[msg.sender] = block.timestamp;

        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, 'Amount must be greater than 0');
        require(_minLockDays > 0, 'Amount must be greater than 0');
        require(stakedBalanceOf(msg.sender) >= amount, 'Amount must be greater or equal to staked amount');

        _totalStaked = _totalStaked.sub(amount);

        _stakedBalances[msg.sender] = _stakedBalances[msg.sender].sub(amount);

        _baseToken.approve(address(this), amount);

        _baseToken.safeTransferFrom(address(this), msg.sender, amount);

        _lastWithdrawTimes[msg.sender] = block.timestamp;

        emit Withdrawn(msg.sender, amount);
    }

    // TODO: jeden tag nur einmal claimen ermöglichen
    function claim() external nonReentrant whenNotPaused calculateReward(msg.sender) {
        uint256 rewardAmount = _rewardBalances[msg.sender];
        require(rewardAmount > 0, 'Amount must be greater than 0');
        require(treasurySupply() >= rewardAmount, 'Not enough tokens in the treasury');

        _rewardBalances[msg.sender] = 0;

        _rewardTreasury.claim(msg.sender, rewardAmount);

        _lastClaimTimes[msg.sender] = block.timestamp;

        emit Claimed(msg.sender, rewardAmount);
    }


    /* ========== MODIFIERS ========== */

    modifier calculateReward(address account) {
        _rewardBalances[account] = rewardBalanceOf(account);
        _;
    }
}