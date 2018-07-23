import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FormControl, FormGroup, InputGroup } from 'react-bootstrap';

export default class EventSearchbar extends Component {

	constructor(props) {
		super(props);

		this.state = {
			eventId: '',
			translator: props.translator
		};
	}

	render() {

		const translate = this.state.translator.translate;

		return (
			<div id="eventSearchBar">
				<FormGroup>
					<InputGroup>
						<FormControl
							type="text"
							value={this.state.eventId}
							placeholder={ translate('HELPER_findByEventId') }
							onChange={event => this.setState({eventId: event.target.value})}
						/>
						<InputGroup.Button>
							<Link 
								to={`/events/${this.state.eventId}`}
								className="btn btn-info"
								disabled={!this.state.eventId} >
								{ translate('CTA_search') }
							</Link>
						</InputGroup.Button>
					</InputGroup>
				</FormGroup>
			</div>
		);
	}
}