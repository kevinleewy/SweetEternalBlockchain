import React from 'react';
import timeConverter from '../utils/timeConverter';

export default ({user, translator}) => {

	if(user == null){
		return (
			<div>
				Loading User Data...
			</div>
		); 
	}

	const translate = translator.translate;

	return (
		<div>
			<h3>{translate('HEADER_userInfo')}</h3>
			<ul className="list-group">
				<li className="list-group-item">{translate('FIELD_name')}: {user[0]}</li>
				<li className="list-group-item">{translate('FIELD_dob')}: {timeConverter(user[1].toNumber())}</li>
				<li className="list-group-item">
					{translate('FIELD_primaryWalletAddress')}: {
						parseInt(user[2], 16) === 0 ? translate('ENTRY_unassigned') : user[2]
					}
				</li>
				<li className="list-group-item">
					{translate('FIELD_secondaryWalletAddress')}: {
						parseInt(user[3], 16) === 0 ? translate('ENTRY_unassigned') : user[3]
					}
				</li>
				<li className="list-group-item">{translate('FIELD_numberOfEvents')}: {user[4].toNumber()}</li>
				<li className="list-group-item">
					{translator.translate('FIELD_defaultEventApproval')}: {
						user[5] ? translate('ENTRY_yes') : translate('ENTRY_no')
					}
				</li>
			</ul>
		</div>
	);
}