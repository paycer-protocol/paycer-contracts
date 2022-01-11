// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./CompoundStrategy.sol";
import "../interfaces/token/IToken.sol";

//solhint-disable no-empty-blocks
contract CompoundStrategyUSDC is CompoundStrategy {
    string public constant NAME = "Strategy-Compound-USDC";
    string public constant VERSION = "2.0.2";

    constructor(
        address _controller,
        address _pool,
        address _compUSDC,
        address _COMP,
        address _comptroller
    )
        public
        CompoundStrategy(
            _controller,
            _pool,
            _compUSDC,
            _COMP,
            _comptroller
        )
    {}
}
