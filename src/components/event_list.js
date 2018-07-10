import React, { Component } from 'react';
import EventListItem from './event_list_item';

export default class EventList extends Component {

	constructor(props) {
		super(props);

		this.state = {
			contract: props.contract,
			eventIds: props.eventIds
		};
	}

	render() {

		const {contract, eventIds} = this.state;

		const eventItems = eventIds.map(eventId => {
			eventId = eventId.toNumber();
			return (
				<EventListItem
					key={eventId}
					id={eventId}
					contract={contract}/>
			);
		});

		return (
			<ul className="list-group">
				{eventItems}
			</ul>
		);
	}
}