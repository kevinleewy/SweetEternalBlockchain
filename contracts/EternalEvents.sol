pragma solidity ^0.4.21;

import "./EternalUsers.sol";

contract EternalEvents is EternalUsers {

    /*** EVENTS ***/

    event EventCreated(uint256 eventId, uint256 indexed creator, uint256 typeId);
    event EventTypeCreated(uint256 eventTypeId, string eventTypeName);
    event EventApproved(uint256 eventId, uint256 indexed participantId);
    event EventDisapproved(uint256 eventId, uint256 indexed participantId);

    /*** CONSTANTS ***/
    uint256 public numOfDaysAgoLimit = 2 weeks;	//applies only to users under bronze tier
    uint256 public eventTypeCountForReward = 5;
    uint256 public eventTypeCreationReward = 10; //enough tokens to hit bronze tier
    uint256 public eventTypeCreationRewardSupply = 50000; //enough for 5000 events

    /*** DATA TYPES ***/

    struct Participant {
        uint256 userId;          		//participant's user ID
        bool approval;          		//participant's approval of event (true by default)
    }

    struct EventType {
        string name;                    //event type name
        address creator;                //creator of event type
        uint256 count;                  //number of events of this type created
    }

    struct Event {
    	uint256 creator;				//user ID of event creator
        uint256 createdOn;				//timestamp of event creation
        uint256 startTime;          	//start time of event
        uint256 endTime;          		//end time of event
        uint32 numOfParticipants;   	//number of event participants
        uint32 locLat;        			//latitude of event location [-90.0000° S, +90.0000° N] maps to [0, 1800000]
        uint32 locLon;        			//longitude of event location [-180.0000°, +180.0000° N] maps to [0, 3600000]
        uint32 typeId;					//event type ID
        string  name;               	//name of event
        string notes;					//description of event;
    }

    /*** STORAGE ***/

    // An array containing all Events in existence. The ID
    // of each Event is actually an index into this array.
    // events[0] is the null event
    Event[] public events;

    //participants[eventId][participantNum]
    mapping(uint256 => mapping(uint256 => Participant)) public participants;

    EventType[] public eventTypes;

    /*** MODIFIERS ***/

    modifier isValidEventId(uint256 _eventId) {
        require (_eventId < events.length);
        _;
    }

    modifier isValidEventTypeId(uint256 _eventTypeId) {
        require (_eventTypeId > 0 && _eventTypeId < eventTypes.length);
        _;
    }

    modifier isValidLocation(uint256 _locLat, uint256 _locLon) {
        require (_locLat <= 1800000 && _locLon <= 3600000);
        _;
    }


    /*** FUNCTIONS ***/

    // Returns the total number of Events currently in existence.
    function totalEvents() public view returns (uint) {
        return events.length;
    }

    // Returns whether the sender is a participant of the specified event
    function isParticipant(uint256 _eventId)
    	public
    	view
    	isValidEventId(_eventId)
    	returns (bool)
    {
    	
    	require(hasUser());

    	uint256 n = events[_eventId].numOfParticipants;

    	for(uint256 i = 0; i < n; i++){
    		Participant memory participant = participants[_eventId][i];
    		if(participant.userId == addressToUser[msg.sender]){
    			return participant.approval;
    		}
    	}

    	return false;
    }

    // Returns an array consisting of event IDs for which the user
    // is an approved participant of.
    // @return array of event IDs
    function eventsOfUser() public view returns (uint256[]) {
    	
    	require(hasUser());

    	uint256 numOfEvents = users[addressToUser[msg.sender]].numOfEvents;

        if (numOfEvents == 0) {
            // Return an empty array
            return new uint256[](0);
        } else {
            uint256[] memory result = new uint256[](numOfEvents);
            uint256 resultIndex = 0;

            for (uint256 i = 0; i < events.length; i++) {
                if (isParticipant(i)) {
                    result[resultIndex] = i;
                    resultIndex++;
                }
            }

            return result;
        }
    }

    function createEventType(string _eventName) public {

        //Add validation

        EventType memory _eventType = EventType({
            name: _eventName,
            creator: msg.sender,
            count: 0
        });

        uint256 newEventTypeId = eventTypes.push(_eventType) - 1;

        //Add bounty

        // emit the EventTypeCreated event
        emit EventTypeCreated(newEventTypeId, _eventName);
    }

    // Returns the total number of Event Types currently in existence
    // We assume that type = 0 is the Null Event Type
    function totalEventTypes() public view returns (uint) {
        return eventTypes.length - 1;
    }

    // Approves an event
    // @param _eventId
    // @param _participantId
    // @event EventApproved
    function approveEvent(uint256 _eventId, uint256 _participantId)
    	public
    	isValidEventId(_eventId)
    {    	
    	require(hasUser());

    	Participant storage participant = participants[_eventId][_participantId];
    	require(participant.userId == addressToUser[msg.sender]);
    	require(participant.approval == false);

    	//Approve event
    	participant.approval = true;
    	users[addressToUser[msg.sender]].numOfEvents++;

    	// emit the EventApproved event
        emit EventApproved(_eventId, _participantId);
    }

	// Disapproves an event
    // @param _eventId
    // @param _participantId
    // @event EventDisapproved
    function disapproveEvent(uint256 _eventId, uint256 _participantId)
    	public
    	isValidEventId(_eventId)
    {     	
    	require(hasUser());

    	Participant storage participant = participants[_eventId][_participantId];
    	require(participant.userId == addressToUser[msg.sender]);
    	require(participant.approval == true);

    	//Disapprove event
    	participant.approval = false;
    	users[addressToUser[msg.sender]].numOfEvents--;

    	// emit the EventDisapproved event
        emit EventDisapproved(_eventId, _participantId);
    }


    // An public method that creates a new Event and stores it.
    // It performs checks and validates priviledges 
    // @param _name,
    // @param _notes,
    // @param _typeId,
    // @param _locLat,
    // @param _locLon,
    // @param _startTime,
    // @param _endTime
    // @event EventCreated
    function createEvent(
    	string _name,
    	string _notes,
    	uint256 _typeId,
    	uint256 _locLat,
    	uint256 _locLon,
    	uint256 _startTime,
    	uint256 _endTime,
    	uint256[] _participantIds
    )
        public
        onlyUser
        isValidEventTypeId(_typeId)
        isValidLocation(_locLat, _locLon)
        returns (uint256)
    {
        require(_endTime >= _startTime);

        //Check for bronze priviledges
        if(now - _startTime > numOfDaysAgoLimit){
        	require(isAtLeastBronze());
        }

        //Check for gold priviledges
        if(_participantIds.length > 5){
            require(isAtLeastGold());
        }

        //Creates the event. Also emits the EventCreated event
        return _createEvent(_name, _notes, _typeId, _locLat, _locLon, _startTime, _endTime, _participantIds);
    }

    // An internal method that creates a new Event and stores it.
    // @assumes all inputs are valid 
    // @assumes all priviledges have been checked
    // @param _name,
    // @param _notes,
    // @param _typeId,
    // @param _locLat,
    // @param _locLon,
    // @param _startTime,
    // @param _endTime
    // @event EventCreated
    function _createEvent(
    	string _name,
    	string _notes,
    	uint256 _typeId,
    	uint256 _locLat,
    	uint256 _locLon,
    	uint256 _startTime,
    	uint256 _endTime,
    	uint256[] _participantIds
    )
        public
        returns (uint256)
    {

        Event memory _event = Event({
        	creator: addressToUser[msg.sender],
	        createdOn: now,
            startTime: _startTime,
	        endTime: _endTime ,
	        numOfParticipants: uint32(_participantIds.length),
	        locLat: uint32(_locLat),
	        locLon: uint32(_locLon),
	        typeId: uint32(_typeId),
	        name: _name,
	        notes: _notes
        });
        uint256 newEventId = events.push(_event) - 1;

        //Iterate over participants
        for (uint256 i = 0; i < _participantIds.length; i++) {
        	uint256 id = _participantIds[i];
        	require(_isValidUserId(id));

        	//Increment numOfEvents
        	User storage user = users[id];
            if(user.defaultApproval){
            	user.numOfEvents += 1;
            }

        	//Create participant
            participants[newEventId][i] = Participant({
            	userId: id,
            	approval: user.defaultApproval
            });
        }

        //Increment counter for event type
        eventTypes[_typeId].count += 1;

        //Calculate rewards for event creator
        _rewardEventCreator(_typeId);

        // emit the EventCreated event
        emit EventCreated(newEventId, addressToUser[msg.sender], _typeId);

        return newEventId;
    }

    function _rewardEventCreator(uint256 _typeId) private {
        if(eventTypeCreationRewardSupply >= eventTypeCreationReward &&
            eventTypes[_typeId].count == eventTypeCountForReward) {
            address creator = eventTypes[_typeId].creator;
            totalSupply_ = totalSupply_.add(eventTypeCreationReward);
            eventTypeCreationRewardSupply = eventTypeCreationRewardSupply.sub(eventTypeCreationReward);
            balances[creator] = balances[creator].add(eventTypeCreationReward);
        }
    }
    
}