import React, { Component } from 'react';
import getWeb3 from '../../utils/getWeb3';
import { Alert } from 'react-bootstrap';

import EternalCoreContract from '../../../node_modules/sweeteternal/build/contracts/EternalCore.json';

import UserInfo from '../../components/profile_user_info';

export default class Profile extends Component {
	constructor(props) {
		super(props)

		this.state = {
			account: null,
			contract: null,
			error: null,
			userId: this.props.match.params.id,
			user: null,
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
	        instance.totalUsers().then(totalUsers => {
	        	if(parseInt(this.state.userId, 10) >= totalUsers.toNumber()){
	        		this.setState({error: "user ID exceeds total number of users"});
	        	} else {
			        instance.users(this.state.userId).then( user => {
						this.setState({ user });
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

	renderUser() {

		if(this.state.contract == null){
			return (
				<div>
					Loading Smart Contract...
				</div>
			); 
		}

		if(this.state.user == null) {
			return (
				<div>
					User does not exist
				</div>
			); 
		}

        return (
        	<UserInfo id={this.state.userId} user={this.state.user} />
		);

	}

	render() {

		return (
			<div>
				<h1>User Profile</h1>
				<hr />
				{this.state.error ? this.renderError() : this.renderUser()}
			</div>
		);
	}
}