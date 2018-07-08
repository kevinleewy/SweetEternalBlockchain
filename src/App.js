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

export default class App extends Component {
	constructor(props) {
		super(props)

		this.state = {
		  account: null,
		  contract: null,
		  mobile: false,
		  web3: null
		}
	}

	componentWillMount() {

	}

	toggleMobile(){
		this.setState({mobile: !this.state.mobile});
	}

	render() {
		return (
			<div>
				<Router basename={'/'}>
					<div className="App">
						
		                <Menubar mobile={this.state.mobile} />

		                <Switch>
		                	<Route path="/users/create" component={CreateUser} />
		                	<Route path="/users/me/edit" component={EditUser} />
		                	<Route path="/users/me" component={MyProfile} />
		                	<Route path="/users/:id([0-9]+)" component={Profile} />
		                	<Route path="/events/create" component={CreateEvent} />
		                	<Route path="/events/me" component={MyEvents} />
		                	<Route path="/events/:id([0-9]+)" component={Event} />
		                	<Route path="/help" component={Help} />
		                	<Route path="/" component={Home} />
		                </Switch>

						<hr />

		                <button className="btn btn-primary" onClick={this.toggleMobile.bind(this)}>{this.state.mobile ? 'Web View' : 'Mobile View'}</button>
					</div>
				</Router>
			</div>
		);
	}
}