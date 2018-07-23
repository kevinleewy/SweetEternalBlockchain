import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import getWeb3 from '../../utils/getWeb3';
import { ControlLabel, FormGroup, FormControl, InputGroup } from 'react-bootstrap';

import EternalCoreContract from '../../../node_modules/sweeteternal/build/contracts/EternalCore.json';

//Styling
import 'react-datepicker/dist/react-datepicker.css';

export default class CreateEvent extends Component {
	constructor(props) {
		super(props)

		this.state = {
			account: null,
			contract: null,
			eventTypes: [],
			eventTypeNameIsPristine: true,
			eventTypeName: '',
			formSubmitted: false,
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

			//Load event types
			instance.totalEventTypes().then( total => {
	 			for(var i = 1; i <= total; i++){
	 				(async eventTypeId => {
	 					var eventType = await instance.eventTypes(eventTypeId);
	 					var eventName = eventType[0].replace(/^\w/, c => c.toUpperCase());
						this.setState({
 							eventTypes: this.state.eventTypes.concat([{
 								id: eventTypeId,
 								name: eventName,
 							}])
 						});
	 				})(i);
	 			}
	 		});
		});
	}

	validateEventTypeName(){
		if(this.state.eventTypeNameIsPristine){
			return null;
		}
		if(this.state.eventTypeName === ''){
			return 'error';
		}
		return 'success'; 
	}

	onEventTypeNameChange(event) {
		this.setState({ 
			eventTypeName: event.target.value,
			eventTypeNameIsPristine: false
		});
	}

	onCreateButtonClick(event) {
		this.state.contract.createEventType.sendTransaction(
			this.state.eventTypeName,
	        {from: this.state.account}
		).then(result => {
			this.setState({formSubmitted: true});
			this.state.contract.EventTypeCreated().watch( (err, response) => {
				if(response.args.eventTypeName === this.state.eventTypeName){
		            alert(`Event type ${this.state.eventTypeName} successfully created!`);
		            this.setState({
		            	eventTypeName: '',
		            	eventTypeNameIsPristine: true,
		            	formSubmitted: false
		            });
		        }
	        });
		});
	}

	render() {

		const translate = this.state.translator.translate;

		return (
			<div>
				<h1>Create New Event Type</h1>
				<hr />
				<h4>Earn EP tokens when others create events of your created event type.</h4>
				<hr />
				<ul className="list-group">
					<li className="list-group-item">
						<FormGroup
							controlId="name"
							validationState={this.validateEventTypeName()}
						>
							<ControlLabel>{translate('FIELD_eventTypeName')}</ControlLabel>
							<InputGroup>
								<FormControl
									type="text"
									value={this.state.eventTypeName}
									placeholder={translate('HELPER_createEventType')}
									onChange={this.onEventTypeNameChange.bind(this)}
									onBlur={() => this.setState({eventTypeNameIsPristine: false})}
								/>
								<FormControl.Feedback />
								<InputGroup.Button>
									<button
										className="btn btn-info"
										onClick={this.onCreateButtonClick.bind(this)}
										disabled={this.state.formSubmitted}>
										{this.state.formSubmitted ? translate('CTA_creating') : translate('CTA_create')}
									</button>
								</InputGroup.Button>
							</InputGroup>
						</FormGroup>
					</li>
				</ul>
				<Link to="/events/create" className="btn btn-primary">
					{translate('CTA_createEvent')}
				</Link>
			</div>
		);
	}
}