import React, { Component } from 'react';
import EventListItem from './event_list_item';

export default class EventList extends Component {

	constructor(props) {
		super(props);

		this.state = {
			contract: props.contract,
			eventIds: props.eventIds,
			translator: props.translator
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
					contract={contract}
					translator={this.state.translator} />
			);
		});

		return (
			<ul className="list-group">
				{eventItems}
			</ul>
		);
	}
}