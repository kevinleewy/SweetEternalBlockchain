import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import getWeb3 from '../../utils/getWeb3';
import { FormGroup, ControlLabel, FormControl, InputGroup, Label } from 'react-bootstrap';

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
			currentDefaultEventApproval: '',
			hasUser: null,
			isAtLeastBronze: false,
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

					//Check for bronze status
			        this.state.contract.isAtLeastBronze({
			        	from: this.state.account
			        }).then( isAtLeastBronze => {
			            this.setState({ isAtLeastBronze });
			        });

					this.state.contract.getMyUser.call({
						from: this.state.account
					}).then( user => {

			            this.setState({ currentDefaultEventApproval:
			            	this.state.translator.translate(
			            		`ENTRY_${user[5] ? 'approve' : 'reject'}`
			            	)
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
		const re = /^.{1,70}$/g;

		if(re.test(this.state.name)) {
		    return 'success';
		} else {
		    return 'error';
		}
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
		            	this.state.translator.translate(
		            		`ENTRY_${user[5] ? 'approve' : 'reject'}`
		            	)
		            });
		        });
	            this.setState({buttonDisabled: false});
	        });
		});
	}

	renderContent() {

		const translate = this.state.translator.translate;

		if(!this.state.hasUser) {
			return (
				<CreateUserButton translator={this.state.translator}/>
			);
		}

		return (
			<div>
				<ul className="list-group">
					<li className="list-group-item">
						<FormGroup
							controlId="name"
							validationState={this.validateName()}
						>
							<ControlLabel>{translate('FIELD_newName')}</ControlLabel>
							<InputGroup>
								<InputGroup.Button>
									<button
										className="btn btn-primary"
										onClick={this.onNameChangeSave.bind(this)}
										disabled={!this.state.isAtLeastBronze || this.state.buttonDisabled}>
										{translate('CTA_save')}
									</button>
								</InputGroup.Button>
								<FormControl
									type="text"
									value={this.state.name}
									placeholder={translate('HELPER_newName')}
									onChange={this.onNameChange.bind(this)}
									onBlur={() => this.setState({nameIsPristine: false})}
								/>
								<FormControl.Feedback />
								
							</InputGroup>
							{ !this.state.isAtLeastBronze &&
								<div>
									<Label bsStyle="danger">*Restrictions apply:</Label>
								    <p>In order to change your name, you must achieve Bronze tier by owning a sufficient amount of EP.</p>
								    <p>For more info, visit the <Link to="/help">help page</Link>.</p>
							    </div>
							}
						</FormGroup>

						<FormGroup
							controlId="assignSecondaryAddress"
							validationState={this.validateSecondaryAddress()}
						>
							<ControlLabel>{translate('FIELD_assignSecondaryWalletAddress')}</ControlLabel>
							<FormControl
								type="text"
								value={this.state.address2}
								placeholder={translate('HELPER_wallet')}
								onChange={this.onAddressChange.bind(this)}
								onBlur={() => this.setState({address2IsPristine: false})}
							/>
							<FormControl.Feedback />

							<button
								className="btn btn-primary"
								onClick={this.onAddressAssign.bind(this)}
								disabled={this.state.buttonDisabled}>
								{translate('CTA_assign')}
							</button>
							&nbsp;
							<button
								className="btn btn-primary"
								onClick={this.onAddressUnassign.bind(this)}
								disabled={this.state.buttonDisabled}>
								{translate('CTA_unassignCurrentSecondaryAddress')}
							</button>
						</FormGroup>
						
					</li>
					<li className="list-group-item">
					    <FormGroup
							controlId="toggleDefaultEventApproval"
						>
							<ControlLabel>Current Default Event Approval</ControlLabel>
							<InputGroup>
								<FormControl
									type="text"
									value={this.state.currentDefaultEventApproval}
									disabled
								/>
								<InputGroup.Button>
									<button
								    	className="btn btn-primary"
								    	onClick={this.toggleDefaultEventApproval.bind(this)}
								    	disabled={this.state.buttonDisabled}>
								    	{translate('CTA_toggle')}
								    </button>
								</InputGroup.Button>
							</InputGroup>
						</FormGroup>

				    </li>
				</ul>
				<br />
				<Link to="/users/me" className="btn btn-primary">
					{translate('CTA_backToProfile')}
				</Link>
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