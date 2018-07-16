import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import getWeb3 from '../../utils/getWeb3';
import Geocode from 'react-geocode';
import GoogleMap from '../../components/google_map';
import EventSearchbar from '../../components/event_searchbar';
import timeConverter from '../../utils/timeConverter';
import { Alert, Pagination } from 'react-bootstrap';

import EternalCoreContract from '../../../node_modules/sweeteternal/build/contracts/EternalCore.json';
import {contractLatitudeToActualLatitude, contractLongitudeToActualLongitude} from '../../utils/coordinateConverter';

Geocode.setApiKey("AIzaSyChh2-k3OdzyXQOiQH8tFhQbuxphjdrfZo");

export default class EventDetails extends Component {
	constructor(props) {
		super(props)

		this.state = {
			account: null,
			contract: null,
			id: parseInt(this.props.match.params.id, 10),
			error: null,
			event: null,
			eventType: null,
			participants: [],
			creator: null,
			location: 'Unknown',
			lat: 0.0,
			lng: 0.0,
			translator: props.translator,
			web3: null
		}
	}

	componentWillMount() {
		this.loadWeb3();
	}

	componentWillReceiveProps(nextProps) {
		this.reload(parseInt(nextProps.match.params.id, 10));
	}

	reload(id){
		this.setState({
			id: id,
			error: null,
			participants: []
		});
		this.loadWeb3();
	}

	loadWeb3() {

		getWeb3.then(results => {
			this.setState({
				web3: results.web3
			});

			//Detect network
			results.web3.version.getNetwork((err, netId) => {
		    	switch (netId) {
					case "1":
						console.log('This is mainnet');
						break;
					case "2":
						console.log('This is the deprecated Morden test network.');
						break;
					case "3":
						console.log('This is the ropsten test network.');
						break;
					case "4":
						console.log('This is the Rinkeby test network.');
						break;
					case "42":
						console.log('This is the Kovan test network.');
						break;
					default:
						console.log(`This is an unknown network of ID ${netId}.`);
				}
			});

			// Get accounts.
			results.web3.eth.getAccounts((error, accounts) => {
				this.setState({account:accounts[0]});
			})
		}).then( () => {
			this.instantiateContract();
		}).catch((err) => {
			console.log(err);
			//console.log('Error finding web3.');
		});

	}

	instantiateContract() {

		const contract = require('truffle-contract')

	    //Extract contract ABI
	    const eternalCore = contract(EternalCoreContract);

	    //Set Web3 Providers
	    eternalCore.setProvider(this.state.web3.currentProvider);

	    eternalCore.deployed().then( instance => {
	        this.setState({contract : instance});

	        //Load event
	        instance.totalEvents().then(totalEvents => {
	        	if(this.state.id < 0){
	        		this.setState({error: "event ID cannot be negative"});
	        	} else if(this.state.id >= totalEvents.toNumber()){
	        		this.setState({error: "event ID exceeds total number of events"});
	        	} else {
			        instance.events(this.state.id).then(event => {
						this.setState({ event });

						//Load event type
						this.state.contract.eventTypes(event[7]).then(eventType => {
							var eventTypeName = eventType[0].replace(/^\w/, c => c.toUpperCase());
							this.setState({ eventType: eventTypeName });
						});

						this.setState({lat: contractLatitudeToActualLatitude(event[5].toNumber())});
			 			this.setState({lng: contractLongitudeToActualLongitude(event[6].toNumber())});
			 			
			 			//Load event creator
			 			instance.users(event[0]).then(user => {
			 				this.setState({creator: user[0]});
			 			})

			 			//Load event participants
			 			for(var i = 0; i < event[4]; i++){
			 				(async participantId => {

			 					var participant = await instance.participants(this.state.id, participantId);
			 					var user = await instance.users(participant[0]);
	 							this.setState({
		 							participants: this.state.participants.concat([{
		 								id: participant[0].toNumber(),
		 								name: user[0],
		 								approval: participant[1]
		 							}])
		 						});
			 
			 				})(i);
			 			}

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
			});
		});
	}

	renderError(){
		return (
			<Alert bsStyle="danger">
  				<strong>{this.state.error}</strong>
  			</Alert>
  		);
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

	renderParticipants(){

		const translate = this.state.translator.translate;

		if(this.state.participants.length === 0){
			return <p>No participants</p>
		}

		const _participants = this.state.participants.map( (p, index) => {
			return (
				<div key={index}>
					<span>
						<Link to={`/users/${p.id}`}>{p.name}</Link>{!p.approval && " ({translate('FIELD_rejected')})"}
					</span>
				</div>
			);
		});

		return (
			<div>
				<p>{translate('FIELD_participants')}:</p>
				{ _participants }
			</div>
		);
	}

	renderEventDetails(){
		const { event, lat, lng, location } = this.state;
		const translate = this.state.translator.translate;

 		if(event == null){
 			return <div>Loading...</div>
 		}

		return (
			<ul className="list-group">
				<li className="list-group-item"><h3>{event[8]}</h3></li>
				<li className="list-group-item"><h4>{translate('FIELD_description')}: {event[9]}</h4></li>
				<li className="list-group-item">{translate('FIELD_eventType')}: {this.state.eventType}</li>
				<li className="list-group-item">{this.renderTimestamp(event[2].toNumber(), event[3].toNumber())}</li>
				<li className="list-group-item">
					<div>
						<p>{translate('FIELD_location')}: {location} ({lat.toFixed(4)}, {lng.toFixed(4)})</p>
						<GoogleMap lat={lat} lng={lng} />
					</div>
				</li>
				<li className="list-group-item">{this.renderParticipants()}</li>	
				<li className="list-group-item">
					<div>
						<p>{translate('FIELD_createdBy')}: <Link to={`/users/${event[0].toNumber()}`}>{this.state.creator}</Link></p>
						<p>{translate('FIELD_createdOn')}: {timeConverter(event[1])}</p>
					</div>
				</li>		
			</ul>
		);
	}

	render() {
		const { id } = this.state;

		return (
			<div>
				<div>
					<h1>Explore Events</h1>
					<EventSearchbar translator={this.state.translator}/>
				</div>
				<hr />
				<Pagination bsSize="medium">
					{id > 0 && <Pagination.Item active={false} onClick={() => this.reload(id - 1)}>{id - 1}</Pagination.Item>}
					<Pagination.Item active={true}>{id}</Pagination.Item>
					<Pagination.Item active={false} onClick={() => this.reload(id + 1)}>{id + 1}</Pagination.Item>
					{id === 0 && <Pagination.Item active={false} onClick={() => this.reload(id + 2)}>{id + 2}</Pagination.Item>}
				</Pagination>
				{this.state.error ? this.renderError() : this.renderEventDetails()}
			</div>
		);
	}
}