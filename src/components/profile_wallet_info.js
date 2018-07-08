import React from 'react';

var getTier = balance => {
	if(balance >= 1000000000){
		return 'DIAMOND';
	}
	if(balance >= 10000000){
		return 'PLATINUM';
	}
	if(balance >= 100000){
		return 'GOLD';
	}
	if(balance >= 1000){
		return 'SILVER';
	}
	if(balance >= 10){
		return 'BRONZE';
	}
	return 'WOOD';
};

export default ({ account, balance }) => {

	

	if(balance == null){
		return (
			<div>
				Loading wallet info...
			</div>
		); 
	}

	return (
		<div>
			<h3>Wallet Info</h3>
			<ul className="col-md-4 list-group">
				<li className="list-group-item">Account: { account }</li>
				<li className="list-group-item">Balance: { balance } EP</li>
				<li className="list-group-item">Tier: { getTier(balance) }</li>
			</ul>
		</div>
	);
}