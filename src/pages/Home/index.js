import React, { Component } from 'react';
import PropTypes from 'prop-types';
import getWeb3 from '../../utils/getWeb3';
import { Badge, Jumbotron } from 'react-bootstrap';

import CreateUserButton from '../../components/create_user_button';
import HomeCarousel from '../../components/home_carousel';

import EternalCoreContract from '../../../node_modules/sweeteternal/build/contracts/EternalCore.json';

export default class Home extends Component {
	constructor(props, context) {
		super(props)

		/**
		 * web3Context = {
		 *   accounts: {Array<string>} - All accounts
		 *   selectedAccount: {string} - Default ETH account address (coinbase)
		 *   network: {string} - One of 'MAINNET', 'ROPSTEN', or 'UNKNOWN'
		 *   networkId: {string} - The network ID (e.g. '1' for main net)
		 * }
		 */
		//console.log(context.web3);

		this.state = {
		  account: null,
		  contract: null,
		  hasUser: false,
		  totalEvents: 'Loading...',
		  totalEventTypes: 'Loading...',
		  totalUsers: 'Loading...',
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
		const contract = require('truffle-contract');

	    //Extract contract ABI
	    const eternalCore = contract(EternalCoreContract);

	    //Set Web3 Providers
	    eternalCore.setProvider(this.state.web3.currentProvider);


	    eternalCore.deployed().then( instance => {
	        this.setState({contract : instance});

	        //Load statistics
	        instance.totalUsers().then( totalUsers => {
				this.setState({ totalUsers: totalUsers.toNumber() });
			});

	        instance.totalEvents().then( totalEvents => {
				this.setState({ totalEvents: totalEvents.toNumber() });
			});

			instance.totalEventTypes().then( totalEventTypes => {
				this.setState({ totalEventTypes: totalEventTypes.toNumber() });
			});

			//Load user
	        instance.hasUser.call({
				from: this.state.account
			}).then( result => {
				this.setState({ hasUser: result });
			});
		}).catch((err) => {
			console.log(err);
		});
	}

	render() {

		const translate = this.state.translator.translate;

		return (
			<div>
				<h1>{translate('HEADER_welcome')}</h1>
				<HomeCarousel />
				<Jumbotron>
					{translate('HOME_message').map( (s,i) => <p key={i}>{s}</p> ) }
				</Jumbotron>
				<h2>Log Events on a Trustless Platform</h2>
				<h4>Once logged, never immutable</h4>
				<p>Powered by Ethereum</p>
				<hr />
				<h2>{translate('HEADER_statistics')}</h2>
				<ul id="statistics" className="list-group">
					<li className="list-group-item">
						{translate('FIELD_totalNumberOfUsers')}: <Badge>{this.state.totalUsers}</Badge>
					</li>
					<li className="list-group-item">
						{translate('FIELD_totalNumberOfEvents')}: <Badge>{this.state.totalEvents}</Badge>
					</li>
					<li className="list-group-item">
						{translate('FIELD_totalNumberOfEventTypes')}: <Badge>{this.state.totalEventTypes}</Badge>
					</li>
				</ul>
				{!this.state.hasUser && <div><hr /><CreateUserButton translator={this.state.translator} /></div>}
			</div>
		);
	}
}

Home.contextTypes = {
  web3: PropTypes.object
};