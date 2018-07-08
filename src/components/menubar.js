import React from 'react';
import { Link } from 'react-router-dom';
import {AppBar, MuiThemeProvider, Tabs, Tab } from 'material-ui';
import reactLogo from '../logo.svg';
import logo from '../assets/images/sweet_eternal_logo_square_transparent.png';
import banner from '../assets/images/sweet_eternal_banner_narrow.jpg';

var webBar = (
	<div>
		<header>
			<img src={reactLogo} className="App-logo" alt="logo.jpg" />
	        <img src={logo} className="App-logo" alt="logo.jpg" />
	        <img src={banner} className="App-banner" alt="logo.jpg" />   
	    </header>
		<Link to="/" className="btn btn-info">Home Page</Link>
        &emsp;
        <Link to="/users/me" className="btn btn-info">My Profile</Link>
        &emsp;
        <Link to="/events/me" className="btn btn-info">My Events</Link>
        &emsp;
        <Link to="/events/1" className="btn btn-info">Explore</Link>
        &emsp;
        <Link to="/help" className="btn btn-info">Help</Link>
	</div>
);

var mobileBar = (
	<div>
		<MuiThemeProvider>
    		<div className="menubar">
				<AppBar
					title="Sweet Eternal">
				</AppBar>

				<Tabs>
					<Tab label="Home Page" containerElement={<Link to="/" />} />
					<Tab label="My Profile" containerElement={<Link to="/users/me" />} />
					<Tab label="My Events" containerElement={<Link to="/events/me" />} />
					<Tab label="Explore" containerElement={<Link to="/events/1" />} />
					<Tab label="Help" containerElement={<Link to="/help" />} />
				</Tabs>

			</div>
		</MuiThemeProvider>
	</div>	
);

export default (props) => {
	return props.mobile ? mobileBar : webBar;
}