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
			location: 'Unknown',
			lat: 0.0,
			lng: 0.0,
		};
	}

	componentWillMount(){
		this.state.contract.events(this.state.id).then(event => {
			this.setState({ event });
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
			return <p>Occured on: {timeConverter(start)}</p>;
		}
		return (
			<div>
				<p>Began on: {timeConverter(start)}</p>
				<p>Ended on: {timeConverter(end)}</p>
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
				{this.renderTimestamp(event[2].toNumber(), event[3].toNumber())}
				<p>Location: {location} ({lat.toFixed(4)}, {lng.toFixed(4)})</p>
				<GoogleMap lat={lat} lng={lng}/>
				<Link to={`/events/${this.state.id}`} className="btn btn-info">More Details</Link>
			</li>
		);
	}
}