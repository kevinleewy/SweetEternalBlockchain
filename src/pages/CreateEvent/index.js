import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import getWeb3 from '../../utils/getWeb3';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import Geocode from "react-geocode";
import { DropdownButton, ControlLabel, FormGroup, FormControl, InputGroup, Label, MenuItem } from 'react-bootstrap';

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
			eventTypes: [],
			selectedEventId: 0,
			formTitleIsPristine: true,
			formDescriptionIsPristine: true,
			formTitle: '',
			formDescription: '',
			formStartTime: moment(),
			formEndTime: moment(),
			formLocation: '',
			formLatitude: 0.0,
			formLongitude: 0.0,
			formParticipant: '',
			formParticipants: {},
			formSubmitted: false,
			mapCenterLatitude: 0.0,
			mapCenterLongitude: 0.0,
			hasUser: null,
			userId: null,
			translator: props.translator,
			walletBalance: null,
			web3: null
		}
	}

	componentWillMount() {

		getWeb3.then(results => {
			this.setState({
				web3: results.web3
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

	        //Load walletBalance
	        instance.balanceOf(this.state.account).then( walletBalance => {
				this.setState({ walletBalance: walletBalance.toNumber() });
			});

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

			//Load event types
			instance.totalEventTypes().then( total => {
	 			for(var i = 1; i <= total; i++){
	 				(async eventTypeId => {
	 					var eventType = await instance.eventTypes(eventTypeId);
	 					var eventName = eventType[0].replace(/^\w/, c => c.toUpperCase());
						this.setState({
 							eventTypes: this.state.eventTypes.concat([{
 								id: eventTypeId,
 								name: eventName,
 							}])
 						});
	 				})(i);
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

	onEventTypeSelect(eventKey) {
		this.setState({selectedEventId: parseInt(eventKey, 10)});
	}

	getSelectedEventType(){
		const eventId = this.state.selectedEventId;
		if(eventId === 0){
			return '';
		}
		return this.state.eventTypes[eventId-1].name;
	}

	calculateMinStartDate(){
		const balance = this.state.walletBalance;
		if(balance < 10){
			return moment().subtract(2, 'weeks');
		}
		if(balance < 1000){
			return moment().subtract(3, 'months');
		}
		if(balance < 100000){
			return moment().subtract(1, 'year');
		}
		if(balance < 10000000){
			return moment().subtract(3, 'years');
		}
		if(balance < 1000000000){
			return moment().subtract(10, 'years');
		}
		return moment(0);

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

	onParticipantChange(event) {
		this.setState({ formParticipant: event.target.value });
	}

	onParticipantBlur(event) {
		if(this.state.formParticipant !== ''){
			const newParticipant = parseInt(this.state.formParticipant, 10);
			this.setState({ formParticipant: '' });	
			if(newParticipant > 0 && !(newParticipant in this.state.formParticipants)){
				this.state.contract.totalUsers().then(totalUsers => {
					if(newParticipant <= totalUsers){
						const newParticipants = Object.assign({}, this.state.formParticipants);
						this.state.contract.users(newParticipant).then(user => {
							newParticipants[newParticipant] = user[0];
							this.setState({
								formParticipants: newParticipants
							});
						});
					}
				});
			}
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
			this.state.selectedEventId,
			actualLatitudeToContractLatitude(this.state.formLatitude),
			actualLongitudeToContractLongitude(this.state.formLongitude),
			this.state.formStartTime.unix(),
			this.state.formEndTime.unix(),
			Object.keys(this.state.formParticipants),
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

	getHighlightedDates(){
		const dates = [];
		var now = this.state.formStartTime.clone();

		while(now.isSameOrBefore(this.state.formEndTime)){
			dates.push(now.clone());
			now.add(1, 'days');
		}
		return dates;
	}

	renderContent(){
		if(!this.state.hasUser) {
			return (
				<CreateUserButton translator={this.state.translator} />
			);
		}

		const translate = this.state.translator.translate;
		const minStartDate = this.calculateMinStartDate();
		const eventTypeOptions = this.state.eventTypes.map( e => {
			return <MenuItem
				key={e.id}
				eventKey={e.id}
				onSelect={this.onEventTypeSelect.bind(this)}
			>
				{e.name}
			</MenuItem>
		});

		return (
			<div>
				<ul className="list-group">
					<li className="list-group-item">
						<FormGroup
							controlId="formTitle"
							validationState={this.validateTitle()}
						>
							<ControlLabel>{translate('FIELD_title')}</ControlLabel>
							<FormControl
								type="text"
								value={this.state.formTitle}
								placeholder={translate('HELPER_eventTitle')}
								onChange={this.onTitleChange.bind(this)}
								onBlur={() => this.setState({formTitleIsPristine: false})}
							/>
							<FormControl.Feedback />
						</FormGroup>

						<FormGroup
							controlId="formDescription"
							validationState={this.validateDescription()}
						>
							<ControlLabel>{translate('FIELD_description')}</ControlLabel>
							<FormControl
								type="text"
								value={this.state.formDescription}
								placeholder={translate('HELPER_eventDescription')}
								onChange={this.onDescriptionChange.bind(this)}
								onBlur={() => this.setState({formDescriptionIsPristine: false})}
							/>
							<FormControl.Feedback />
						</FormGroup>

						<FormGroup
							controlId="formEventType"
						>
							
							<ControlLabel>{translate('FIELD_eventType')}</ControlLabel>
							<InputGroup>
							<DropdownButton
								componentClass={InputGroup.Button}
								id="input-dropdown-addon"
								title={ translate('CTA_select') }
							>
								{ eventTypeOptions }
							</DropdownButton>
							<FormControl
								type="text"
								value={this.getSelectedEventType()}
								placeholder={translate('HELPER_selectEventType')}
							/>
							<FormControl.Feedback />
							</InputGroup>
							<Label bsStyle="info">Don't see the event type you want?</Label>
						    <p>Create one <Link to="/createEventType">here</Link>!</p>
						    <p>For more info, visit the <Link to="/help">help page</Link>.</p>
						</FormGroup>
					</li>

					<li className="list-group-item">
						<strong>{translate('FIELD_beganOn')}*:</strong>
						<DatePicker
					        selected={this.state.formStartTime}
					        onChange={this.onStartTimeChange.bind(this)}
					        minDate={minStartDate}
					        highlightDates={this.getHighlightedDates()} />
					    <br />
					    <strong>{translate('FIELD_endedOn')}:</strong>
					    <DatePicker
					        selected={this.state.formEndTime}
					        onChange={this.onEndTimeChange.bind(this)}
					        minDate={this.state.formStartTime}
					        highlightDates={this.getHighlightedDates()} />
					    <br />
					    <Label bsStyle="danger">*Restrictions apply:</Label>
					    <p>Based on your tier, your start date can be as far back as {minStartDate.format("MM/DD/YYYY")}.</p>
					    <p>For more info, visit the <Link to="/help">help page</Link>.</p>
					</li>

					<li className="list-group-item">
						<FormGroup
							controlId="formLocation"
							validationState={null}
						>
							<ControlLabel>{translate('FIELD_location')}</ControlLabel>
							<FormControl
								type="text"
								value={this.state.formLocation}
								placeholder={translate('HELPER_eventLocation')}
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
					<li className="list-group-item">
						<FormGroup
							controlId="formParticipants"
							validationState={null}
						>
							<ControlLabel>{translate('FIELD_participants')}</ControlLabel>
							<FormControl
								type="text"
								value={this.state.formParticipant}
								placeholder={translate('HELPER_eventParticipant')}
								onChange={this.onParticipantChange.bind(this)}
								onBlur={this.onParticipantBlur.bind(this)}
							/>
							<ul className="list-group">
								{Object.keys(this.state.formParticipants).map(
									id => <li className="list-group-item" key={id}>{this.state.formParticipants[id]}</li>
								)}
							</ul>
						</FormGroup>
					</li>
				</ul>
				<button
					className="btn btn-primary"
					onClick={this.onCreateButtonClick.bind(this)}
					disabled={this.state.formSubmitted}>
					{this.state.formSubmitted ? translate('CTA_creating') : translate('CTA_create')}
				</button>
				&nbsp;
				<Link to="/events/me" className="btn btn-primary">
					{translate('CTA_backToMyEvents')}
				</Link>
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