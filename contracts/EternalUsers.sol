pragma solidity ^0.4.21;

import "./EternalPriviledges.sol";

contract EternalUsers is EternalPriviledges {

    /*** EVENTS ***/

    event UserCreated(address indexed account, uint256 userId, string name, uint256 _dob);
    event UserNameChanged(uint256 indexed userId, string newName);
    event UserDefaultApprovalToggled(uint256 indexed userId, bool newSetting);
    event SecondaryAddressSet(uint256 indexed userId, address indexed newAddress);


    /*** DATA TYPES ***/

    struct User {
        string  name;               //name of user     (changeable)
        uint256 dob;                //date of birth    (permanent)
        address primaryAddress;     //main address     (permanent)
        address secondaryAddress;   //backup address   (changeable)
        uint256 numOfEvents;        //total number of events ()
        bool defaultApproval;       //default approval status to apply to events
    }


    /*** STORAGE ***/

    // An array containing all Users in existence. The ID
    // of each User is actually an index into this array.
    // users[0] is the null user
    User[] public users;


    mapping(address => uint256) public addressToUser;

    /*** MODIFIERS ***/

    modifier onlyUser() {
        require(hasUser());
        _;
    }

    /*** FUNCTIONS ***/

    // Returns the total number of Users currently in existence.
    function totalUsers() public view returns (uint) {
        return users.length - 1;
    }

    function hasUser() public view returns (bool) {
        return addressToUser[msg.sender] != 0;
    }

    function getUserId() public view onlyUser returns (uint256) {

        return addressToUser[msg.sender];
    }

    // Returns all the relevant information about the caller's User.
    function getMyUser()
        public
        view
        onlyUser
        returns (
        string name,
        uint256 dob,
        address primaryAddress,
        address secondaryAddress,
        uint256 numOfEvents,
        bool defaultApproval
    ) {
        (name, dob, primaryAddress, secondaryAddress, numOfEvents, defaultApproval) = this.users(addressToUser[msg.sender]);
    }


    // Change name of user
    // Sender must be assigned to user (either primary or secondary)
    // @param _name New name to be assigned
    // @event UserNameChanged
    function changeName(string _name) public onlyUser bronzePriviledge {
        
        uint256 userId = addressToUser[msg.sender];

        //Retrieve user
        User storage user = users[userId];

        //Check that new name is different (doesn't work)
        //require(_name != user.name);

        user.name = _name;

        emit UserNameChanged(userId, _name);
    }

    // Sets the secondary addresses of user.
    // Sender must be the primary address
    // @param _address Address to set as secondary address of user
    // @event SecondaryAddressSet
    function setSecondaryAddress(address _address) public onlyUser {
        
        uint256 userId = addressToUser[msg.sender];

        //Retrieve user
        User storage user = users[userId];

        //Validate sender's rights to user
        require(msg.sender == user.primaryAddress);

        //Validate that _address has not been assigned to another user
        require(addressToUser[_address] == 0);

        //Unset previous secondary address
        addressToUser[user.secondaryAddress] = 0; //point to null user

        //Set address
        addressToUser[_address] = userId;
        user.secondaryAddress = _address;

        emit SecondaryAddressSet(userId, _address);
    }

    // Unsets the secondary addresses of user.
    // Sender must be the primary address
    // @event SecondaryAddressSet
    function unsetSecondaryAddress() public onlyUser {
        
        uint256 userId = addressToUser[msg.sender];

        //Retrieve user
        User storage user = users[userId];

        //Validate sender's rights to user
        require(msg.sender == user.primaryAddress);

        //Validate that secondary address has been set
        require(user.secondaryAddress != 0);

        //Unset address
        addressToUser[user.secondaryAddress] = 0; //point to null user
        user.secondaryAddress = address(0);

        emit SecondaryAddressSet(userId, address(0));
    }

    // Swaps the addresses of user. Intended to allow setting
    // secondary address of user as primary instead.
    // Sender must be the secondary address
    function swapAddressesOfUser() public onlyUser {

        //Retrieve user
        User storage user = users[addressToUser[msg.sender]];

        //Validate sender's rights to user
        require(msg.sender == user.secondaryAddress);

        //Swap address
        user.secondaryAddress = user.primaryAddress;
        user.primaryAddress = msg.sender;
    }

    // Change name of user
    // Sender must be assigned to user (either primary or secondary)
    // @param _name New name to be assigned
    // @event UserDefaultApprovalToggled
    function toggleDefaultApproval() public onlyUser {
        
        uint256 userId = addressToUser[msg.sender];

        //Retrieve user
        User storage user = users[userId];

        user.defaultApproval = !user.defaultApproval;

        emit UserDefaultApprovalToggled(userId, user.defaultApproval);
    }

    function _isValidUserId(uint256 _userId) internal view returns (bool) {
        return (_userId > 0 && _userId <= users.length);
    }

    function _isAuthenticatedSender(User _user) internal view returns (bool) {
        return (msg.sender == _user.primaryAddress || msg.sender == _user.secondaryAddress);
    }


    // An internal method that creates a new User and stores it.
    // @assumes all inputs are valid 
    // @assumes sender is not associated with an existing user
    // @param _name  Name of this User
    // @param _dob   in Unix timestamp https://www.unixtimestamp.com/index.php
    // @param _defaultApproval
    // @event UserCreated
    function _createUser(string _name, uint256 _dob, bool _defaultApproval)
        internal
        returns (uint256)
    {
        User memory _user = User({
            name             : _name,
            dob              : _dob,
            primaryAddress   : msg.sender,
            secondaryAddress : 0,
            numOfEvents      : 0,
            defaultApproval  : _defaultApproval
        });
        uint256 newUserId = users.push(_user) - 1;
        addressToUser[msg.sender] = newUserId;

        // emit the UserCreated event
        emit UserCreated(msg.sender, newUserId, _name, _dob);

        return newUserId;
    }

}