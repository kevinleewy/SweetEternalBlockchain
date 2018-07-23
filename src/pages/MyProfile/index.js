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
					{this.state.translator.translate('INFO_loadingSmartContract')}
				</div>
			); 
		}

		if(!this.state.hasUser) {
			return (
				<CreateUserButton translator={this.state.translator} />
			);
		}

        return (
        	<div>
				<UserInfo user={this.state.user} translator={this.state.translator} />
				<Link to="/users/me/edit" className="btn btn-primary">
					{this.state.translator.translate('CTA_edit')}
				</Link>
			</div>
		);

	}

	renderWallet() {

		if(this.state.contract == null){
			return (
				<div>
					{this.state.translator.translate('INFO_loadingSmartContract')}
				</div>
			); 
		}

		return (
			<WalletInfo
				account={this.state.account}
				balance={this.state.walletBalance}
				contract={this.state.contract}
				translator={this.state.translator} />
		);
	}

	render() {

		return (
			<div>
				<h1>{this.state.translator.translate('HEADER_myProfile')}</h1>
				<hr />
				{ this.renderUser() }
				<hr />
				{ this.renderWallet() }
			</div>
		);
	}
}