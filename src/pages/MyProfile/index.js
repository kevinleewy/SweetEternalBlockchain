import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import getWeb3 from '../../utils/getWeb3';

import EternalCoreContract from '../../../node_modules/sweeteternal/build/contracts/EternalCore.json';

import CreateUserButton from '../../components/create_user_button';
import UserInfo from '../../components/profile_user_info';
import WalletInfo from '../../components/profile_wallet_info';

export default class MyProfile extends Component {
	constructor(props) {
		super(props)

		this.state = {
			account: null,
			contract: null,
			hasUser: true,
			translator: props.translator,
			user: null,
			walletBalance: null,
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
					this.state.contract.getMyUser.call({
						from: this.state.account
					}).then( user => {
			            this.setState({ user });
			        });
				}
			});
		});
	}

	renderUser() {

		if(this.state.contract == null){
			return (
				<div>
					Loading Smart Contract...
				</div>
			); 
		}

		if(!this.state.hasUser) {
			return (
				<CreateUserButton />
			);
		}

        return (
        	<div>
				<UserInfo user={this.state.user} />
				<Link to="/users/me/edit" className="btn btn-primary">Edit</Link>
			</div>
		);

	}

	renderWallet() {

		return (
			<WalletInfo account={this.state.account} balance={this.state.walletBalance} />
		);
	}

	render() {

		return (
			<div>
				<h1>{this.state.translator.translate('HEADER_myProfile')}</h1>
				<hr />
				{this.renderUser()}
				<hr />
				{ this.renderWallet() }
			</div>
		);
	}
}