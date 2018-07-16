import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Geocode from 'react-geocode';
import GoogleMap from '../components/google_map';
import timeConverter from '../utils/timeConverter';
import {contractLatitudeToActualLatitude, contractLongitudeToActualLongitude} from '../utils/coordinateConverter';

Geocode.setApiKey("AIzaSyChh2-k3OdzyXQOiQH8tFhQbuxphjdrfZo");

export default class EventListItem extends Component {

	constructor(props) {
		super(props);

		this.state = {
			contract: props.contract,
			id: props.id,
			event: null,
			eventType: null,
			location: 'Unknown',
			lat: 0.0,
			lng: 0.0,
			translator: props.translator
		};
	}

	componentWillMount(){
		this.state.contract.events(this.state.id).then(event => {
			this.setState({ event });

			//Load event type
			this.state.contract.eventTypes(event[7]).then(eventType => {
				var eventTypeName = eventType[0].replace(/^\w/, c => c.toUpperCase());
				this.setState({ eventType: eventTypeName });
			});

			this.setState({lat: contractLatitudeToActualLatitude(event[5].toNumber())});
 			this.setState({lng: contractLongitudeToActualLongitude(event[6].toNumber())});
 			// Get address from latitude & longitude.
			(Geocode.fromLatLng(this.state.lat, this.state.lng).then(
				response => {
					const location = response.results[0].formatted_address;
					this.setState({ location });
				},
				error => {
					console.error(error);
				}
			));
		});
	}

	renderTimestamp(start, end){
		if(start === end){
			return <p>{this.state.translator.translate('FIELD_occuredOn')}: {timeConverter(start)}</p>;
		}
		return (
			<div>
				<p>{this.state.translator.translate('FIELD_beganOn')}: {timeConverter(start)}</p>
				<p>{this.state.translator.translate('FIELD_endedOn')}: {timeConverter(end)}</p>
			</div>
		);
	}

	render() {

 		const { event, lat, lng, location } = this.state;

 		if(event == null){
 			return <div>Loading...</div>
 		}

		return (
			<li className="list-group-item">
				<h3>{event[8]}</h3>
				<hr />
				<h4>{event[9]}</h4>
				<p>{this.state.translator.translate('FIELD_eventType')}: {this.state.eventType}</p>
				{this.renderTimestamp(event[2].toNumber(), event[3].toNumber())}
				<p>{this.state.translator.translate('FIELD_location')}: {location} ({lat.toFixed(4)}, {lng.toFixed(4)})</p>
				<GoogleMap lat={lat} lng={lng}/>
				<Link to={`/events/${this.state.id}`} className="btn btn-info">{this.state.translator.translate('CTA_moreDetails')}</Link>
			</li>
		);
	}
}