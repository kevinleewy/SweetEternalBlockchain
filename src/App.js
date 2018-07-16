import React, { Component } from 'react';
import getWeb3 from './utils/getWeb3';
//import PropTypes from 'prop-types';

import { Alert } from 'react-bootstrap'
import {BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Web3Provider } from 'react-web3';

//Styling
import './css/oswald.css';
import './css/open-sans.css';
import './css/pure-min.css';
import './App.css';

//Pages
import CreateEvent from './pages/CreateEvent';
import CreateEventType from './pages/CreateEventType';
import CreateUser from './pages/CreateUser';
import EditUser from './pages/EditUser';
import Event from './pages/EventDetails';
import Help from './pages/Help';
import Home from './pages/Home';
import MyEvents from './pages/MyEvents';
import MyProfile from './pages/MyProfile';
import Profile from './pages/Profile';

//User-defined components
import Menubar from './components/menubar';
import Footer from './components/footer';

//Contract ABI
import EternalCoreContract from '../node_modules/sweeteternal/build/contracts/EternalCore.json';


//Utilities
import translator from './utils/translator';

export default class App extends Component {
	constructor(props) {
		super(props)

		this.state = {
		  account: null,
		  contract: null,
		  error: null,
		  language: translator.getLocale(),
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

		}).catch((err) => {
			this.setState({error : err});
		});
	}

	onLanguageSelect(eventKey){
		this.setState({ language: eventKey });
		translator.setLocale(eventKey);
	}

	onChangeAccount(account){
		console.log(`Account:${account}`);
		this.setState({ account });
	}

	render() {
		return (
			<div>
				<Router basename={'/'}>
					<div className="App">
						
		                <Menubar
		                	currentLanguage={this.state.language}
		                	onLanguageSelect={this.onLanguageSelect.bind(this)}
		                	translator={ translator } />
		                <div className="body">
		                	<Web3Provider onChangeAccount={this.onChangeAccount.bind(this)}>
	                		{this.state.error && <Alert bsStyle="danger"><strong>{this.state.error.message}</strong></Alert>}
			                <Switch>
			                	<Route path="/users/create" render={(props) => <CreateUser {...props} translator={ translator } />} />
			                	<Route path="/users/me/edit" render={(props) => <EditUser {...props} translator={ translator } />} />
			                	<Route path="/users/me" render={(props) => <MyProfile {...props} translator={ translator } />} />
			                	<Route path="/users/:id([0-9]+)" render={(props) => <Profile {...props} translator={ translator } />} />
			                	<Route path="/createEventType" render={(props) => <CreateEventType {...props} translator={ translator } />} />
			                	<Route path="/events/create" render={(props) => <CreateEvent {...props} translator={ translator } />} />
			                	<Route path="/events/me" render={(props) => <MyEvents {...props} translator={ translator } />} />
			                	<Route path="/events/:id([0-9]+)" render={(props) => <Event {...props} translator={ translator } />} />
			                	<Route path="/help" render={(props) => <Help {...props} translator={ translator } />} />
			                	<Route path="/" render={(props) => <Home {...props} translator={ translator } />} />
			                </Switch>
		                	</Web3Provider>
		                </div>
		            	<Footer />
					</div>
				</Router>
			</div>
		);
	}
}