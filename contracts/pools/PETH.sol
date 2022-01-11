// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./PTokenBase.sol";
import "../interfaces/token/IToken.sol";

contract PETH is PTokenBase {
    TokenLike public immutable weth;
    bool internal shouldDeposit = true;

    constructor(
        address _token,
        address _addressListFactory,
        address _controller
    ) public PTokenBase("pETH Pool", "pETH", _token, _token, _addressListFactory, _controller)
    {
        weth = TokenLike(_token);
    }

    /// @dev Handle incoming ETH to the contract address.
    receive() external payable {
        if (shouldDeposit) {
            deposit();
        }
    }

    /// @dev Burns tokens/shares and returns the ETH value, after fee, of those.
    function withdrawETH(uint256 shares) external whenNotShutdown nonReentrant {
        require(shares != 0, "Withdraw must be greater than 0");
        _beforeBurning(shares);
        uint256 sharesAfterFee = _handleFee(shares);
        uint256 amount = sharesAfterFee.mul(totalValue()).div(totalSupply());
        _burn(_msgSender(), sharesAfterFee);

        uint256 balanceHere = tokensHere();
        if (balanceHere < amount) {
            _withdrawCollateral(amount.sub(balanceHere));
            balanceHere = tokensHere();
            amount = balanceHere < amount ? balanceHere : amount;
        }
        // Unwrap WETH to ETH
        shouldDeposit = false;
        weth.withdraw(amount);
        shouldDeposit = true;
        Address.sendValue(_msgSender(), amount);

        emit Withdraw(_msgSender(), shares, amount);
    }

    /**
     * @dev Receives ETH and grants new tokens/shares to the sender depending
     * on the value of pool's share.
     */
    function deposit() public payable whenNotPaused nonReentrant {
        uint256 shares = _calculateShares(msg.value);
        // Wraps ETH in WETH
        weth.deposit{value: msg.value}();
        _mint(_msgSender(), shares);
    }
}
