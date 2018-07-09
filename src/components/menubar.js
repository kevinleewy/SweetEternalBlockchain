import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { SplitButton, MenuItem } from 'react-bootstrap';
import {AppBar, MuiThemeProvider, Tabs, Tab } from 'material-ui';

import LanguageMenu from './language_menu';

import reactLogo from '../logo.svg';
import logo from '../assets/images/sweet_eternal_logo_square_transparent.png';
import banner from '../assets/images/sweet_eternal_banner_narrow.jpg';

export default class CreateEvent extends Component {
	constructor(props) {
		super(props)

		this.state = {
			onLanguageSelect: props.onLanguageSelect,
			mobile: props.mobile,
			translator: props.translator
		}
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			mobile: nextProps.mobile
		});
	}

	getCurrentLanguage(){
		switch(this.state.currentLanguage){
			case 'en' : return 'English';
			case 'zh' : return '中文';
			default: return '';
		}
	}

	renderWebBar() {

		const translate = this.state.translator.translate;

		return (
			<div>
				<header>

					<img src={reactLogo} className="App-logo" alt="logo.jpg" />
			        <img src={logo} className="App-logo" alt="logo.jpg" />
			        <img src={banner} className="App-banner" alt="logo.jpg" />

			        <LanguageMenu
			        	currentLanguage={this.state.translator.getLocale()}
			        	onSelect={this.state.onLanguageSelect} />   
			    
		     	</header>
			    <div>
					<Link to="/" className="btn btn-info">{translate('HEADER_homePage')}</Link>
			        &emsp;
			        <Link to="/users/me" className="btn btn-info">{translate('HEADER_myProfile')}</Link>
			        &emsp;
			        <Link to="/events/me" className="btn btn-info">{translate('HEADER_myEvents')}</Link>
			        &emsp;
			        <Link to="/events/1" className="btn btn-info">Explore</Link>
			        &emsp;
			        <Link to="/help" className="btn btn-info">Help</Link>
		        </div>
			</div>
		);
	}

	renderMobileBar() {

		const translate = this.state.translator.translate;

		return (
			<div>
				<MuiThemeProvider>
		    		<div className="menubar">
						<AppBar
							title="Sweet Eternal"
						>
							<LanguageMenu
					        	currentLanguage={this.state.translator.getLocale()}
					        	onSelect={this.state.onLanguageSelect} /> 
						</AppBar>

						<Tabs>
							<Tab label={translate('HEADER_homePage')} containerElement={<Link to="/" />} />
							<Tab label={translate('HEADER_myProfile')} containerElement={<Link to="/users/me" />} />
							<Tab label={translate('HEADER_myEvents')} containerElement={<Link to="/events/me" />} />
							<Tab label="Explore" containerElement={<Link to="/events/1" />} />
							<Tab label="Help" containerElement={<Link to="/help" />} />
						</Tabs>

					</div>
				</MuiThemeProvider>
			</div>	
		);
	}

	render() {
		return this.state.mobile ? this.renderMobileBar() : this.renderWebBar();
	}
}