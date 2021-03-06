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
			translator: props.translator,
			user: null,
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
				<CreateUserButton translator={this.state.translator} />
			);
		}

		if(eventIds == null){
 			return <div>Loading event IDs...</div>
 		}

		return (
			<div>
				<EventList contract={contract} eventIds={eventIds} translator={this.state.translator}/>
			</div>
		);
	}

	render() {

		return (
			<div>
				<h1>{this.state.translator.translate('HEADER_myEvents')}</h1>
				<hr />
				<Link to="/events/create" className="btn btn-primary">
					{this.state.translator.translate('CTA_createEvent')}
				</Link>
				<hr />
				{this.renderContent()}
			</div>
		);
	}
}