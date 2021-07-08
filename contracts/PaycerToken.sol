// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract PaycerToken is ERC20Capped, Ownable {

    /* ========== CONSTRUCTOR ========== */

    constructor(uint256 _totalSupply) ERC20('PaycerToken', 'PCR') ERC20Capped(_totalSupply) {}

    /* ========== VIEWS ========== */

    function getChainId() external view returns (uint256) {
        uint256 chainId;
        
        assembly {
            chainId := chainid()
        }

        return chainId;
    }

    /* ========== MUTATIVE FUNCTIONS ========== */
    
    function mint(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }
}