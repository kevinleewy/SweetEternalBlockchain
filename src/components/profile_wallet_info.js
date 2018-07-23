import React, { Component } from 'react';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

var getTier = balance => {
	if(balance >= 1000000000){
		return 'DIAMOND';
	}
	if(balance >= 10000000){
		return 'PLATINUM';
	}
	if(balance >= 100000){
		return 'GOLD';
	}
	if(balance >= 1000){
		return 'SILVER';
	}
	if(balance >= 10){
		return 'BRONZE';
	}
	return 'WOOD';
};

export default class WalletInfo extends Component {
	constructor(props) {
		super(props)

		this.state = {
			account: props.account,
			balance: props.balance,
			contract: props.contract,
			address: '',
			addressIsPristine: true,
			amount: '',
			amountIsPristine: true,
			buttonDisabled: false,
			translator: props.translator,
			web3: null
		}
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			account: nextProps.account,
			balance: nextProps.balance,
			contract: nextProps.contract,
			translator: nextProps.translator
		});
	}

	validateAddress(){
		if(this.state.addressIsPristine){
			return null;
		}
		const re = /^(0x)*[0-9A-Fa-f]{40}$/g;

		if(re.test(this.state.address)) {
		    return 'success';
		} else {
		    return 'error';
		}
	}

	validateAmount(){
		if(this.state.amountIsPristine){
			return null;
		}

		if(isNaN(this.state.amount) || parseInt(this.state.amount, 10) > this.state.balance){
			return 'error';
		}
		return 'success';
	}

	onAddressChange(event) {
		this.setState({ 
			address: event.target.value,
			addressIsPristine: false
		});
	}

	onAmountChange(event) {
		this.setState({ 
			amount: event.target.value,
			amountIsPristine: false
		});
	}

	onTransferClick(event){
		const prefix = /^0x/g;
		const newAddress = prefix.test(this.state.address) ? this.state.address : `0x${this.state.address2}`;

		this.state.contract.transfer.sendTransaction(
			newAddress,
			this.state.amount,
	        {from: this.state.account}
		).then(result => {
			this.setState({buttonDisabled: true});
			this.state.contract.Transfer({
				from: this.state.account,
				to: this.state.newAddress
			}).watch( (err, response) => {
	            alert(`Successfully transfered ${response.args.value} EP to ${response.args.to}`);
	            this.setState({
	            	address: '',
	            	addressIsPristine: true,
	            	amount: '',
	            	amountIsPristine: true,
	            	buttonDisabled: false
	            });
	        });
		});
	}

	render() {

		const { account, balance } = this.state;
		const translate = this.state.translator.translate;

		if(balance === null){
			return (
				<div>
					Loading wallet info...
				</div>
			); 
		}

		return (
			<div>
				<h3>{translate('HEADER_walletInfo')}</h3>
				<ul className="list-group">
					<li className="list-group-item">{translate('FIELD_account')}: { account }</li>
					<li className="list-group-item">{translate('FIELD_balance')}: { balance } EP</li>
					<li className="list-group-item">{translate('FIELD_tier')}: { getTier(balance) }</li>
					<li className="list-group-item">
						{translate('FIELD_transferEP')}:
						<FormGroup
							controlId="recipientAddress"
							validationState={this.validateAddress()}
						>
							<ControlLabel>{translate('FIELD_recipientAddress')}</ControlLabel>
							<FormControl
								type="text"
								value={this.state.recipient}
								placeholder={translate('HELPER_wallet')}
								onChange={this.onAddressChange.bind(this)}
								onBlur={() => this.setState({address2IsPristine: false})}
							/>
							<FormControl.Feedback />

						</FormGroup>
						<FormGroup
							controlId="amount"
							validationState={this.validateAmount()}
						>
							<ControlLabel>{translate('FIELD_amountToTransfer')}</ControlLabel>
							<FormControl
								type="text"
								value={this.state.amount}
								placeholder={translate('HELPER_amountToTransfer')}
								onChange={this.onAmountChange.bind(this)}
								onBlur={() => this.setState({amountIsPristine: false})}
							/>
							<FormControl.Feedback />

						</FormGroup>
						<button
							className="btn btn-primary"
							onClick={this.onTransferClick.bind(this)}
							disabled={this.state.buttonDisabled}>
							{translate('CTA_transfer')}
						</button>
					</li>
				</ul>
			</div>
		);
	}
}