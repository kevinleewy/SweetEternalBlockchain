pragma solidity ^0.4.21;

import "./EternalToken.sol";

contract EternalPriviledges is EternalToken {

    //Minimum number of EternalPoints (EP) required
    //per tier in order to unlock priviledges
    uint256 public BRONZE_THRESHOLD   = 10;
    uint256 public SILVER_THRESHOLD   = 1000;
    uint256 public GOLD_THRESHOLD     = 100000;
    uint256 public PLATINUM_THRESHOLD = 10000000;
    uint256 public DIAMOND_THRESHOLD  = 1000000000;

    modifier bronzePriviledge() {
        require(isAtLeastBronze());
        _;
    }

    modifier silverPriviledge() {
        require(isAtLeastSilver());
        _;
    }

    modifier goldPriviledge() {
        require(isAtLeastGold());
        _;
    }

    modifier platinumPriviledge() {
        require(isAtLeastPlatinum());
        _;
    }

    modifier diamondPriviledge() {
        require(isAtLeastDiamond());
        _;
    }

    function isAtLeastBronze() public view returns (bool) {
        return balances[msg.sender] >= BRONZE_THRESHOLD;
    }

    function isAtLeastSilver() public view returns (bool) {
        return balances[msg.sender] >= SILVER_THRESHOLD;
    }

    function isAtLeastGold() public view returns (bool) {
        return balances[msg.sender] >= GOLD_THRESHOLD;
    }

    function isAtLeastPlatinum() public view returns (bool) {
        return balances[msg.sender] >= PLATINUM_THRESHOLD;
    }

    function isAtLeastDiamond() public view returns (bool) {
        return balances[msg.sender] >= DIAMOND_THRESHOLD;
    }
}