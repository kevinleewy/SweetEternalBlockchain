import React from 'react';
import timeConverter from '../utils/timeConverter';

export default ({user}) => {

	if(user == null){
		return (
			<div>
				Loading User Data...
			</div>
		); 
	}

	return (
		<div>
			<h3>User Info</h3>
			<ul className="list-group">
				<li className="list-group-item">Name: {user[0]}</li>
				<li className="list-group-item">Date of Birth: {timeConverter(user[1].toNumber())}</li>
				<li className="list-group-item">Primary Wallet Address: {parseInt(user[2], 16) === 0 ? 'Unassigned' : user[2]}</li>
				<li className="list-group-item">Secondary Wallet Address: {parseInt(user[3], 16) === 0 ? 'Unassigned' : user[3]}</li>
				<li className="list-group-item">Number of Events: {user[4].toNumber()}</li>
				<li className="list-group-item">Default Event Approval: {user[5] ? 'Yes' : 'No'}</li>
			</ul>
		</div>
	);
}