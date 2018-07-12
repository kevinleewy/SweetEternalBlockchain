import React, { Component } from 'react';
//import getWeb3 from './utils/getWeb3';
//import PropTypes from 'prop-types';

import {BrowserRouter as Router, Switch, Route } from 'react-router-dom';

//Styling
import './css/oswald.css';
import './css/open-sans.css';
import './css/pure-min.css';
import './App.css';

//Pages
import CreateEvent from './pages/CreateEvent';
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

//Utilities
import translator from './utils/translator';

export default class App extends Component {
	constructor(props) {
		super(props)

		this.state = {
		  account: null,
		  contract: null,
		  language: translator.getLocale(),
		  web3: null
		}
	}

	componentWillMount() {

	}

	onLanguageSelect(eventKey){
		this.setState({ language: eventKey });
		translator.setLocale(eventKey);
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
			                <Switch>
			                	<Route path="/users/create" render={(props) => <CreateUser {...props} translator={ translator } />} />
			                	<Route path="/users/me/edit" render={(props) => <EditUser {...props} translator={ translator } />} />
			                	<Route path="/users/me" render={(props) => <MyProfile {...props} translator={ translator } />} />
			                	<Route path="/users/:id([0-9]+)" render={(props) => <Profile {...props} translator={ translator } />} />
			                	<Route path="/events/create" render={(props) => <CreateEvent {...props} translator={ translator } />} />
			                	<Route path="/events/me" render={(props) => <MyEvents {...props} translator={ translator } />} />
			                	<Route path="/events/:id([0-9]+)" render={(props) => <Event {...props} translator={ translator } />} />
			                	<Route path="/help" render={(props) => <Help {...props} translator={ translator } />} />
			                	<Route path="/" render={(props) => <Home {...props} translator={ translator } />} />
			                </Switch>
		                </div>

		            	<Footer />
					</div>
				</Router>
			</div>
		);
	}
}