// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./PTokenBase.sol";

//solhint-disable no-empty-blocks
contract PLINK is PTokenBase {
    constructor(
        address _token,
        address _weth,
        address _addressListFactory,
        address _controller
    ) public PTokenBase("pLINK Pool", "pLINK", _token, _weth, _addressListFactory, _controller)
    {}
}
