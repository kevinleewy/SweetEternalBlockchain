import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import getWeb3 from '../../utils/getWeb3';

import EternalCoreContract from '../../../node_modules/sweeteternal/build/contracts/EternalCore.json';

import CreateUserButton from '../../components/create_user_button';
import EventList from '../../components/event_list';

export default class MyEvents extends Component {
	constructor(props) {
		super(props)

		this.state = {
			account: null,
			contract: null,
			events: null,
			hasUser: true,
			user: null,
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

	        instance.hasUser.call({
				from: this.state.account
			}).then( result => {
				this.setState({ hasUser: result });
				if(result){
					instance.getMyUser.call({
						from: this.state.account
					}).then( user => {
			            this.setState({ user });
			        });

			        instance.eventsOfUser.call({
						from: this.state.account
					}).then( eventIds => {
						this.setState({ eventIds });
			        });
				}
			});
		});
	}

	renderContent() {
		const {contract, eventIds} = this.state;

		if(contract == null){
			return <div>Loading contract...</div>
		}

		if(!this.state.hasUser) {
			return (
				<CreateUserButton />
			);
		}

		if(eventIds == null){
 			return <div>Loading event IDs...</div>
 		}

		return (
			<div>
				<EventList contract={contract} eventIds={eventIds} />
			</div>
		);
	}

	render() {

		return (
			<div>
				<h1>My Events</h1>
				<hr />
				<Link to="/events/create" className="btn btn-primary">Create Event</Link>
				<hr />
				{this.renderContent()}
			</div>
		);
	}
}