import React, { Component } from 'react';
import getWeb3 from '../../utils/getWeb3';
import { Jumbotron } from 'react-bootstrap';

import CreateUserButton from '../../components/create_user_button';

import EternalCoreContract from '../../../node_modules/sweeteternal/build/contracts/EternalCore.json';

export default class Home extends Component {
	constructor(props) {
		super(props)

		this.state = {
		  account: null,
		  contract: null,
		  hasUser: false,
		  totalEvents: 'Loading...',
		  totalUsers: 'Loading...',
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

	        //Load statistics
	        instance.totalUsers().then( totalUsers => {
				this.setState({ totalUsers: totalUsers.toNumber() });
			});

	        instance.totalEvents().then( totalEvents => {
				this.setState({ totalEvents: totalEvents.toNumber() });
			});

			//Load user
	        instance.hasUser.call({
				from: this.state.account
			}).then( result => {
				this.setState({ hasUser: result });
			});
		});
	}

	render() {
		return (
			<div>
				<h1>Welcome</h1>
				<Jumbotron>
					<p>People come and go</p>
					<p>But memories last forever</p>
					<p>Preserve memories for all eternity</p>
				</Jumbotron>
				<h2>Sweet Eternal</h2>
				<h4>Memories on the Blockchain</h4>
				<p>Powered by Ethereum</p>
				<hr />
				<h2>Statistics</h2>
				<ul className="col-md-4 list-group">
					<li className="list-group-item">Total Number of Users: {this.state.totalUsers}</li>
					<li className="list-group-item">Total Number of Events: {this.state.totalEvents}</li>
				</ul>
				{!this.state.hasUser && <div><hr /><CreateUserButton /></div>}
			</div>
		);
	}
}