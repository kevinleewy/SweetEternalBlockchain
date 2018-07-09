import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import getWeb3 from '../../utils/getWeb3';
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
			});
		});
	}

	onNameChange(event) {
		this.setState({ name: event.target.value });
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
		return (
			<div>
				<h3>You're one step away creating permanent memories on the blockchain</h3>
				<table className="table">
					<thead>
						<tr>
							<th align="center">Name</th>
							<th>Date of Birth</th>
							<th>Birth Location</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>
								<input
									placeholder="Name"
									value={this.state.name}
									onChange={this.onNameChange.bind(this)} />
							</td>
							<td>
								<DatePicker
							        selected={this.state.dob}
							        onChange={this.onDobChange.bind(this)} />
					    	</td>
					    	<td>
						    	<input
									size="40"
									placeholder="Input birth location"
									value={this.state.birthLocation}
									onChange={this.onBirthLocationChange.bind(this)}
									onBlur={this.onBirthLocationBlur.bind(this)} />
								<GoogleMap 
									lat={this.state.mapCenterLatitude}
									lng={this.state.mapCenterLongitude} />
					    	</td>
				    	</tr>
					</tbody>
				</table>

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