import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import getWeb3 from '../../utils/getWeb3';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import Geocode from "react-geocode";
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

import {actualLatitudeToContractLatitude, actualLongitudeToContractLongitude} from '../../utils/coordinateConverter';
import CreateUserButton from '../../components/create_user_button';
import GoogleMap from '../../components/google_map';
import EternalCoreContract from '../../../node_modules/sweeteternal/build/contracts/EternalCore.json';

//Styling
import 'react-datepicker/dist/react-datepicker.css';

export default class CreateEvent extends Component {
	constructor(props) {
		super(props)

		this.state = {
			account: null,
			contract: null,
			formTitleIsPristine: true,
			formDescriptionIsPristine: true,
			formTitle: '',
			formDescription: '',
			formStartTime: moment(),
			formEndTime: moment(),
			formLocation: '',
			formLatitude: 0.0,
			formLongitude: 0.0,
			formSubmitted: false,
			mapCenterLatitude: 0.0,
			mapCenterLongitude: 0.0,
			hasUser: null,
			userId: null,
			translator: props.translator,
			web3: null
		}
	}

	componentWillMount() {

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

	        //Load user
	        instance.hasUser.call({
				from: this.state.account
			}).then( result => {
				this.setState({ hasUser: result });

				if(result){
					this.state.contract.addressToUser(this.state.account).then( userId => {
			            this.setState({ userId });
			        });
				}
			});
		});
	}

	validateTitle(){
		if(this.state.formTitleIsPristine){
			return null;
		}
		if(this.state.formTitle === ''){
			return 'error';
		}
		return 'success'; 
	}

	validateDescription(){
		if(this.state.formDescriptionIsPristine){
			return null;
		}
		if(this.state.formDescription === ''){
			return 'error';
		}
		return 'success'; 
	}

	onTitleChange(event) {
		this.setState({ 
			formTitle: event.target.value,
			formTitleIsPristine: false
		});
	}

	onDescriptionChange(event) {
		this.setState({
			formDescription: event.target.value,
			formDescriptionIsPristine: false
		});
	}

	onStartTimeChange(date) {
		this.setState({ formStartTime: date });
	}

	onEndTimeChange(date) {
		this.setState({ formEndTime: date });
	}

	onLocationChange(event) {
		this.setState({ formLocation: event.target.value });
	}

	onLocationBlur(event) {
		if(this.state.formLocation !== ''){
			Geocode.fromAddress(this.state.formLocation).then(
				response => {
					const { lat, lng } = response.results[0].geometry.location;
					console.log(lat, lng);
					this.setState({ 
						formLatitude: lat,
						formLongitude: lng,
						mapCenterLatitude: lat,
						mapCenterLongitude: lng
					});
				},
				error => {
					console.error(error);
				}
			);
		}
	}

	onMapClick(event){
		this.setState({
			formLatitude: event.lat,
			formLongitude: event.lng
		});
		(Geocode.fromLatLng(event.lat, event.lng).then(
			response => {
				const location = response.results[0].formatted_address;
				this.setState({ formLocation: location });
			},
			error => {
				console.error(error);
			}
		));
	}

	onCreateButtonClick(event) {
		this.state.contract.createEvent.sendTransaction(
			this.state.formTitle,
			this.state.formDescription,
			0,
			actualLatitudeToContractLatitude(this.state.formLatitude),
			actualLongitudeToContractLongitude(this.state.formLongitude),
			this.state.formStartTime.unix(),
			this.state.formEndTime.unix(),
			[1],
	        {from: this.state.account}
		).then(result => {
			this.setState({formSubmitted: true});
			this.state.contract.EventCreated({
				creator: this.state.userId
			}).watch( (err, response) => {
	            alert(`Event successfully created!`);
	            this.setState({
	            	formTitle: '',
	            	formTitleIsPristine: true,
	            	formDescription: '',
	            	formDescriptionIsPristine: true,
	            	formStartTime: moment(),
	            	formEndTime: moment(),
	            	formLocation: '',
	            	formSubmitted: false
	            });
	        });
		});
	}

	renderContent(){
		if(!this.state.hasUser) {
			return (
				<CreateUserButton />
			);
		}

		return (
			<div>
				<ul className="list-group">
					<li className="list-group-item">
						<FormGroup
							controlId="formTitle"
							validationState={this.validateTitle()}
						>
							<ControlLabel>Title</ControlLabel>
							<FormControl
								type="text"
								value={this.state.formTitle}
								placeholder="Enter event title"
								onChange={this.onTitleChange.bind(this)}
								onBlur={() => this.setState({formTitleIsPristine: false})}
							/>
							<FormControl.Feedback />
						</FormGroup>

						<FormGroup
							controlId="formDescription"
							validationState={this.validateDescription()}
						>
							<ControlLabel>Description</ControlLabel>
							<FormControl
								type="text"
								value={this.state.formDescription}
								placeholder="Enter event description"
								onChange={this.onDescriptionChange.bind(this)}
								onBlur={() => this.setState({formDescriptionIsPristine: false})}
							/>
							<FormControl.Feedback />
						</FormGroup>
					</li>

					<li className="list-group-item">
						<strong>Start Time:</strong>
						<DatePicker
					        selected={this.state.formStartTime}
					        onChange={this.onStartTimeChange.bind(this)} />
					    <br />
					    <strong>End Time:</strong>
					    <DatePicker
					        selected={this.state.formEndTime}
					        onChange={this.onEndTimeChange.bind(this)}
					        minDate={this.state.formStartTime} />
					</li>

					<li className="list-group-item">
						<FormGroup
							controlId="formLocation"
							validationState={null}
						>
							<ControlLabel>Location</ControlLabel>
							<FormControl
								type="text"
								value={this.state.formLocation}
								placeholder="Enter event location"
								onChange={this.onLocationChange.bind(this)}
								onBlur={this.onLocationBlur.bind(this)}
							/>
						</FormGroup>

						<div>
							<input
								size="10"
								placeholder="Latitude"
								value={this.state.formLatitude.toFixed(4)}
								disabled="true" />
							<input
								size="10"
								placeholder="Longitude"
								value={this.state.formLongitude.toFixed(4)}
								disabled="true" />
						</div>
						<GoogleMap 
							lat={this.state.mapCenterLatitude}
							lng={this.state.mapCenterLongitude}
							onClick={this.onMapClick.bind(this)}/>
					</li>
				</ul>
				<button
					className="btn btn-primary"
					onClick={this.onCreateButtonClick.bind(this)}
					disabled={this.state.formSubmitted}>
					{this.state.formSubmitted ? 'Creating...' : 'Create'}
				</button>
				&nbsp;
				<Link to="/events/me" className="btn btn-primary">Back to My Events</Link>
			</div>
		);
	}

	render() {

		return (
			<div>
				<h1>Create New Event</h1>
				<hr />
				{this.renderContent()}
			</div>
		);
	}
}