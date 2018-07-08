pragma solidity ^0.4.21;

import "./EternalEvents.sol";

contract EternalCore is EternalEvents {

    /// @notice Creates the main SweetEternal smart contract instance.
    constructor() public Ownable() EternalToken() {

        // start with the null user 0 - so that all valid user IDs are non-zero
        _createUser("Null User", 0, false);

        //Create first real user
        //Doing so will make this address lose reference to null user
        //Does not fail because addressToUser[msg.sender] is still 0
        createUser(
            "Kevin Lee Wei Yang",   //name
            729475200,              //dob
            930567,                 //3.0567° N
            2815851,                //101.5851° E
            true                    //defaultApproval
        );

    }

    // Reject all Ether from being sent here accidentally.
    function() external payable {
        require(false);
    }

    //Public function to properly create a user. This function
    //creates a user as well as a Birthday event.
    function createUser(
        string _name,
        uint256 _dob,
        uint256 _birthLocLat,
        uint256 _birthLocLon,
        bool _defaultApproval
    )
        public
        isValidLocation(_birthLocLat, _birthLocLon)
    {

        //Verify that sender does not have a user yet
        require(addressToUser[msg.sender] == 0);

        //Create the user. Also emits the UserCreated event
        uint256 userId = _createUser(_name, _dob, _defaultApproval);

        //Create the birtday event. Also emits the EventCreated event
        uint256[] memory participants = new uint256[](1);
        participants[0] = userId;
        _createEvent("Your birthday", "The start of a new beginning", 1, _birthLocLat, _birthLocLon, _dob, _dob, participants);
    }

}