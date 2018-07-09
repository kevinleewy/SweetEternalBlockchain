import React from 'react';

export default (props) => {
	const translate = props.translator.translate;

	return (
		<div>
			<h1>{translate('HEADER_help')}</h1>
			<hr />
			<p>Help content coming soon...</p>
		</div>
	);
}