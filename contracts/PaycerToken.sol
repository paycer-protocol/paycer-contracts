// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract PaycerToken is ERC20, Ownable {
    constructor(uint256 _initialSupply) ERC20('PaycerToken', 'PCR') {
        _mint(msg.sender, _initialSupply);
    }
}