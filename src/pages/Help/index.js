import React from 'react';
import { Table } from 'react-bootstrap';

export default (props) => {
	const translate = props.translator.translate;

	return (
		<div id="helpContent">
			<h1>{translate('HEADER_help')}</h1>
			<hr />
			<ul className="list-group">
				<li className="list-group-item">
					<h3>Events</h3>
					<hr />
					<p>Some description about events</p>
				</li>
				<li className="list-group-item">
					<h3>Tokens</h3>
					<hr />
					<p>Tokens are not required in order to create a user or events. However, having a certain number of tokens will unlock some priviledges that will give users more flexibility in event creation. The following table lists the tiered priviledges.</p>
					<Table striped bordered condensed hover>
						<thead>
							<tr>
								<th valign="top">Tier</th>
								<th>Minimum Tokens</th>
								<th>Priviledges</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>Wood</td>
								<td>0</td>
								<td>Create a tier 1 event that occured no more than 2 weeks ago, with up to 5 participants. The exception to this is the birthday event that gets created when the user is created.</td>
							</tr>
							<tr>
								<td>Bronze</td>
								<td>10</td>
								<td>2 week restriction on event creation lifted.</td>
							</tr>
							<tr>
								<td>Silver</td>
								<td>1000</td>
								<td>Create a tier 2 event</td>
							</tr>
							<tr>
								<td>Gold</td>
								<td>100000</td>
								<td>Restriction on number of participants lifted.</td>
							</tr>
							<tr>
								<td>Platinum</td>
								<td>10000000</td>
								<td>Create a tier 3 event</td>
							</tr>
							<tr>
								<td>Diamond</td>
								<td>1000000000</td>
								<td>Create an event type at a tier of choice.</td>
							</tr>
						</tbody>
					</Table>
				</li>
				<li className="list-group-item">
					<p>More help content coming soon...</p>
				</li>
			</ul>
		</div>
	);
}