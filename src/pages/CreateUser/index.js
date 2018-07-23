import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import getWeb3 from '../../utils/getWeb3';
import { ControlLabel, FormGroup, FormControl } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import Geocode from "react-geocode";

import GoogleMap from '../../components/google_map';
import {actualLatitudeToContractLatitude, actualLongitudeToContractLongitude} from '../../utils/coordinateConverter';
import EternalCoreContract from '../../../node_modules/sweeteternal/build/contracts/EternalCore.json';

//Styling
import 'react-datepicker/dist/react-datepicker.css';

export default class CreateUser extends Component {
	constructor(props) {
		super(props)

		this.state = {
			account: null,
			contract: null,
			name: '',
			nameIsPristine: true,
			dob: moment(),
			birthLocation: '',
			mapCenterLatitude: 0.0,
			mapCenterLongitude: 0.0,
			hasUser: null,
			formSubmitted: false,
			translator: props.translator,
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

	        //Load user
	        instance.hasUser.call({
				from: this.state.account
			}).then( result => {
				this.setState({ hasUser: result });
			});
		});
	}

	validateName(){
		if(this.state.nameIsPristine){
			return null;
		}
		const re = /^.{1,70}$/g;

		if(re.test(this.state.name)) {
		    return 'success';
		} else {
		    return 'error';
		}
	}

	onNameChange(event) {
		this.setState({
			name: event.target.value,
			nameIsPristine: false
		});
	}

	onDobChange(date) {
		this.setState({ dob: date });
	}

	onBirthLocationChange(event) {
		this.setState({ birthLocation: event.target.value });
	}

	onBirthLocationBlur(event) {
		Geocode.fromAddress(this.state.birthLocation).then(
			response => {
				const { lat, lng } = response.results[0].geometry.location;
				console.log(lat, lng);
				this.setState({ 
					mapCenterLatitude: lat,
					mapCenterLongitude: lng
				});
			},
			error => {
				console.error(error);
			}
		);
	}

	createUser(event){
		
		this.state.contract.createUser.sendTransaction(
			this.state.name,
	        this.state.dob.unix(),
	        actualLatitudeToContractLatitude(this.state.mapCenterLatitude),
	        actualLongitudeToContractLongitude(this.state.mapCenterLongitude),
	        true,
	        {from: this.state.account}
		).then(result => {
			this.setState({formSubmitted: true});
			this.state.contract.UserCreated({
				account: this.state.account
			}).watch( (err, response) => {
	            alert(`User ID ${response.args.userId} successfully created for address ${response.args.account}! `);
	            this.setState({
	            	name: '',
	            	dob: moment(),
	            	birthLocation: '',
	            	nameIsPristine: true,
	            	formSubmitted: false
	            });
	        });
		});
	}

	renderUserExists() {
		return (
			<div>
				<h3>You have already created a user</h3>
				<Link to="/users/me" className="btn btn-primary">To Profile</Link>
			</div>
		);
	}

	renderCreateUser() {

		const translate = this.state.translator.translate;

		return (
			<div>
				<h3>You're one step away creating permanent memories on the blockchain</h3>
				<ul className="list-group">
					<li className="list-group-item">
						<FormGroup
							controlId="formName"
							validationState={this.validateName()}
						>
							<ControlLabel>{translate('FIELD_name')}</ControlLabel>
							<FormControl
								type="text"
								value={this.state.name}
								placeholder={translate('HELPER_newName')}
								onChange={this.onNameChange.bind(this)}
								onBlur={() => this.setState({nameIsPristine: false})}
							/>
							<FormControl.Feedback />
						</FormGroup>
					</li>
					<li className="list-group-item">

						<strong>{translate('FIELD_dob')}:</strong>
						<DatePicker
					        selected={this.state.dob}
					        onChange={this.onDobChange.bind(this)} />

			        </li>
			        <li className="list-group-item">

				        <strong>{translate('FIELD_pob')}:</strong>
				        <br />
				        <input
							size="40"
							placeholder="Input birth location"
							value={this.state.birthLocation}
							onChange={this.onBirthLocationChange.bind(this)}
							onBlur={this.onBirthLocationBlur.bind(this)} />
						<GoogleMap 
							lat={this.state.mapCenterLatitude}
							lng={this.state.mapCenterLongitude} />
					</li>
				</ul>

				<button
					className="btn btn-primary"
					onClick={this.createUser.bind(this)}
					disabled={this.state.formSubmitted}>
					{this.state.formSubmitted ? 'Creating...' : 'Create'}
				</button>
			</div>
		);
	}

	render() {

		return (
			<div>
				<h1>Create New User</h1>
				<hr />
				{this.state.hasUser ? this.renderUserExists() : this.renderCreateUser()}
			</div>
		);
	}
}