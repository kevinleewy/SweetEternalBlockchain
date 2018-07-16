import React from 'react';
import { Link } from 'react-router-dom';

export default (props) => {

	const translate = props.translator.translate;

	return (
		<div>
			<p>
				You have not created a user yet. Create one today!
			</p>
			<Link to="/users/create" className="btn btn-primary">
				{translate('CTA_createUser')}
			</Link>
		</div>
	);
};