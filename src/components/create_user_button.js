import React from 'react';
import { Link } from 'react-router-dom';

export default (props) => {
	return (
		<div>
			<p>
				You have not created a user yet. Create one today!
			</p>
			<Link to="/users/create" className="btn btn-primary">
				Create User
			</Link>
		</div>
	);
};