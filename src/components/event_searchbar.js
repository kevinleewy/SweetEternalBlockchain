import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class EventSearchbar extends Component {

	constructor(props) {
		super(props);

		this.state = {
			eventId: ''
		};
	}

	render() {

		return (
			<div className="searchbar">
				<input
					size="15"  
					placeholder="Find by event ID"
					value={this.state.eventId}
					onChange={event => this.setState({eventId: event.target.value})}/>
				&nbsp;
				<Link 
					to={`/events/${this.state.eventId}`}
					className="btn btn-info"
					disabled={!this.state.eventId} >
					Search
				</Link>
			</div>
		);
	}
}