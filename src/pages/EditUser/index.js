import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import getWeb3 from '../../utils/getWeb3';

import CreateUserButton from '../../components/create_user_button';

import EternalCoreContract from '../../../node_modules/sweeteternal/build/contracts/EternalCore.json';

export default class EditUser extends Component {
	constructor(props) {
		super(props)

		this.state = {
			account: null,
			contract: null,
			name: '',
			currentDefaultEventApproval: null,
			hasUser: null,
			userId: null,
			saveButtonDisabled: false,
			toggleButtonDisabled: false,
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

				if(result){

					this.state.contract.addressToUser(this.state.account).then( userId => {
			            this.setState({ userId });
			        });

					this.state.contract.getMyUser.call({
						from: this.state.account
					}).then( user => {

			            this.setState({ currentDefaultEventApproval:
			            	user[5] ? 'Approve' : 'Reject'
			            });
			        });
				}

			});
		});
	}

	onNameChange(event) {
		this.setState({ name: event.target.value });
	}

	onNameChangeSave(event){
		this.state.contract.changeName.sendTransaction(
			this.state.name,
	        {from: this.state.account}
		).then(result => {
			this.setState({saveButtonDisabled: true});
			this.state.contract.UserNameChanged().watch( (err, response) => {
	            if(response.args.userId.toNumber()){
		            alert(`Name successfully changed to ${response.args.newName}`);
		            this.setState({
		            	name: '',
		            	saveButtonDisabled: false
		            });
		        }
	        });
		});
	}

	toggleDefaultEventApproval(event){
		this.state.contract.toggleDefaultApproval.sendTransaction(
	        {from: this.state.account}
		).then(result => {
			this.setState({toggleButtonDisabled: true});
			this.state.contract.UserDefaultApprovalToggled().watch( (err, response) => {
	            if(response.args.userId.toNumber()){
		            alert("Setting toggled!");
		            this.state.contract.getMyUser.call({
						from: this.state.account
					}).then( user => {

			            this.setState({ currentDefaultEventApproval:
			            	user[5] ? 'Approve' : 'Reject'
			            });
			        });
		            this.setState({toggleButtonDisabled: false});
		        }
	        });
		});
	}

	renderContent() {
		if(!this.state.hasUser) {
			return (
				<CreateUserButton />
			);
		}

		return (
			<div>
				<ul className="col-md-4 list-group">
					<li className="list-group-item">
						Name Change:
						&nbsp;
						<input
							placeholder="Input a name"
							value={this.state.name}
							onChange={this.onNameChange.bind(this)}/>
						&nbsp;
						<button
							className="btn btn-primary"
							onClick={this.onNameChangeSave.bind(this)}
							disabled={this.state.saveButtonDisabled}>
							Save
						</button>
					</li>
					<li className="list-group-item">
						Current Default Event Approval: {this.state.currentDefaultEventApproval}
						&nbsp;
					    <button
					    	className="btn btn-primary"
					    	onClick={this.toggleDefaultEventApproval.bind(this)}
					    	disabled={this.state.toggleButtonDisabled}>
					    	Toggle
					    </button>
				    </li>
				</ul>
				<br />
				<Link to="/users/me" className="btn btn-primary">Back To Profile</Link>
			</div>
		);
	}

	render() {

		return (
			<div>
				<h1>Edit User Info</h1>
				<hr />
				{this.renderContent()}
			</div>
		);
	}
}