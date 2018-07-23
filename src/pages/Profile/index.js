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
			userId: parseInt(this.props.match.params.id, 10),
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


	    eternalCore.deployed().then( async instance => {
	        this.setState({contract : instance});

	        //Load user
	        const id = this.state.userId;
	        const totalUsers = await instance.totalUsers();
	        if(id <= 0 || id > totalUsers.toNumber()){
        		this.setState({error: this.state.translator.translate('INFO_invalidUserId')});
        	} else {
        		const user = await instance.users(id);
        		this.setState({ user });
			}
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
					{this.state.translator.translate('INFO_loadingSmartContract')}
				</div>
			); 
		}

		if(this.state.user == null) {
			return (
				<div>
					{this.state.translator.translate('INFO_userDNE')}
				</div>
			); 
		}

        return (
        	<UserInfo user={this.state.user} translator={this.state.translator} />
		);

	}

	render() {

		return (
			<div>
				<h1>{this.state.translator.translate('HEADER_userProfile')}</h1>
				<hr />
				{this.state.error ? this.renderError() : this.renderUser()}
			</div>
		);
	}
}