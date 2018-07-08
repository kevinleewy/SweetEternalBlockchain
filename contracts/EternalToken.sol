pragma solidity ^0.4.21;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol';

contract EternalToken is Ownable, StandardToken {

    /*** CONSTANTS ***/

    string public name = "EternalPoints";
    string public symbol = "EP";
    uint8 public decimals = 0;
    uint public INITIAL_SUPPLY = 1000000000000;

    constructor() public {
        totalSupply_ = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
    }
}