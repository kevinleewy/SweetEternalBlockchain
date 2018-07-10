import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import getWeb3 from '../../utils/getWeb3';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

import CreateUserButton from '../../components/create_user_button';

import EternalCoreContract from '../../../node_modules/sweeteternal/build/contracts/EternalCore.json';

export default class EditUser extends Component {
	constructor(props) {
		super(props)

		this.state = {
			account: null,
			contract: null,
			name: '',
			nameIsPristine: true,
			address2: '',
			address2IsPristine: true,
			currentDefaultEventApproval: null,
			hasUser: null,
			userId: null,
			buttonDisabled: false,
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

	validateName(){
		if(this.state.nameIsPristine){
			return null;
		}
		if(this.state.name === ''){
			return 'error';
		}
		return 'success'; 
	}

	validateSecondaryAddress(){
		if(this.state.address2IsPristine){
			return null;
		}
		const re = /^(0x)*[0-9A-Fa-f]{40}$/g;

		if(re.test(this.state.address2)) {
		    return 'success';
		} else {
		    return 'error';
		}
		/*
		if(parseInt(this.state.address2, 16).toString(16) !== this.state.address2){
			return 'error';
		}
		return 'success'; */
	}

	onNameChange(event) {
		this.setState({ 
			name: event.target.value,
			nameIsPristine: false
		});
	}

	onAddressChange(event) {
		this.setState({ 
			address2: event.target.value,
			address2IsPristine: false
		});
	}

	onNameChangeSave(event){
		this.state.contract.changeName.sendTransaction(
			this.state.name,
	        {from: this.state.account}
		).then(result => {
			this.setState({buttonDisabled: true});
			this.state.contract.UserNameChanged({
				userId: this.state.userId
			}).watch( (err, response) => {
	            alert(`Name successfully changed to ${response.args.newName}`);
	            this.setState({
	            	name: '',
	            	nameIsPristine: true,
	            	buttonDisabled: false
	            });
	        });
		});
	}

	onAddressAssign(event){
		const prefix = /^0x/g;
		const newAddress = prefix.test(this.state.address2) ? this.state.address2 : `0x${this.state.address2}`;

		this.state.contract.setSecondaryAddress.sendTransaction(
			newAddress,
	        {from: this.state.account}
		).then(result => {
			this.setState({buttonDisabled: true});
			this.state.contract.SecondaryAddressSet({
				userId: this.state.userId,
				newAddress: newAddress
			}).watch( (err, response) => {
	            alert(`Secondary address assigned to ${response.args.newAddress}`);
	            this.setState({
	            	address2: '',
	            	address2IsPristine: true,
	            	buttonDisabled: false
	            });
	        });
		});
	}

	onAddressUnassign(event){
		this.state.contract.unsetSecondaryAddress.sendTransaction(
	        {from: this.state.account}
		).then(result => {
			this.setState({buttonDisabled: true});
			this.state.contract.SecondaryAddressSet({
				userId: this.state.userId,
				newAddress: '0x0000000000000000000000000000000000000000'
			}).watch( (err, response) => {
	            alert(`Secondary address successfully unset`);
	            this.setState({
	            	address2: '',
	            	address2IsPristine: true,
	            	buttonDisabled: false
	            });
	        });
		});
	}

	toggleDefaultEventApproval(event){
		this.state.contract.toggleDefaultApproval.sendTransaction(
	        {from: this.state.account}
		).then(result => {
			this.setState({buttonDisabled: true});
			this.state.contract.UserDefaultApprovalToggled({
				userId: this.state.userId
			}).watch( (err, response) => {
	            alert("Setting toggled!");
	            this.state.contract.getMyUser.call({
					from: this.state.account
				}).then( user => {

		            this.setState({ currentDefaultEventApproval:
		            	user[5] ? 'Approve' : 'Reject'
		            });
		        });
	            this.setState({buttonDisabled: false});
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
						<FormGroup
							controlId="name"
							validationState={this.validateName()}
						>
							<ControlLabel>New Name</ControlLabel>
							<FormControl
								type="text"
								value={this.state.name}
								placeholder="Enter new name"
								onChange={this.onNameChange.bind(this)}
								onBlur={() => this.setState({nameIsPristine: false})}
							/>
							<FormControl.Feedback />

							<button
								className="btn btn-primary"
								onClick={this.onNameChangeSave.bind(this)}
								disabled={this.state.buttonDisabled}>
								Save
							</button>
						</FormGroup>

						<FormGroup
							controlId="assignSecondaryAddress"
							validationState={this.validateSecondaryAddress()}
						>
							<ControlLabel>Assign Secondary Wallet Address</ControlLabel>
							<FormControl
								type="text"
								value={this.state.address2}
								placeholder="Enter a wallet address"
								onChange={this.onAddressChange.bind(this)}
								onBlur={() => this.setState({address2IsPristine: false})}
							/>
							<FormControl.Feedback />

							<button
								className="btn btn-primary"
								onClick={this.onAddressAssign.bind(this)}
								disabled={this.state.buttonDisabled}>
								Assign
							</button>
							&nbsp;
							<button
								className="btn btn-primary"
								onClick={this.onAddressUnassign.bind(this)}
								disabled={this.state.buttonDisabled}>
								Unassign Current Secondary Address
							</button>
						</FormGroup>
						
					</li>
					<li className="list-group-item">
						Current Default Event Approval: {this.state.currentDefaultEventApproval}
						&nbsp;
					    <button
					    	className="btn btn-primary"
					    	onClick={this.toggleDefaultEventApproval.bind(this)}
					    	disabled={this.state.buttonDisabled}>
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