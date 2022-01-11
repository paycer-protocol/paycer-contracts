// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./PTokenBase.sol";

//solhint-disable no-empty-blocks
contract PDAI is PTokenBase {
    constructor(
        address _token,
        address _weth,
        address _addressListFactory,
        address _controller
    ) public PTokenBase("pDAI Pool", "pDAI", _token, _weth, _addressListFactory, _controller)
    {}
}
