// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./PTokenBase.sol";

//solhint-disable no-empty-blocks
contract PWBTC is PTokenBase {
    constructor(
        address _token,
        address _weth,
        address _addressListFactory,
        address _controller
    ) public PTokenBase("pWBTC Pool", "pWBTC", _token, _weth, _addressListFactory, _controller)
    {}

    /// @dev Convert to 18 decimals from token defined decimals.
    function convertTo18(uint256 _value) public pure override returns (uint256) {
        return _value.mul(10**10);
    }

    /// @dev Convert from 18 decimals to token defined decimals.
    function convertFrom18(uint256 _value) public pure override returns (uint256) {
        return _value.div(10**10);
    }
}
