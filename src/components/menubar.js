import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { MenuItem, Nav, Navbar, NavDropdown, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import {AppBar, MuiThemeProvider, Tabs, Tab } from 'material-ui';

import LanguageMenu from './language_menu';

//import reactLogo from '../logo.svg';
import logo from '../assets/images/sweet_eternal_logo_square_transparent.png';

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

	render() {
		const translate = this.state.translator.translate;

		return (
			<Navbar fixedTop inverse collapseOnSelect>
				<Navbar.Header>
					<Navbar.Brand>
						<LinkContainer to="/">
							<NavItem eventKey={0}>
								<img src={logo} alt="logo.jpg" />
							</NavItem>
						</LinkContainer>
					</Navbar.Brand>
					<Navbar.Toggle />
				</Navbar.Header>
				<Navbar.Collapse>
					<Nav pullRight>
						<LinkContainer to="/">
							<NavItem eventKey={1}>
								{translate('HEADER_homePage')}
							</NavItem>
						</LinkContainer>
						<LinkContainer to="/users/me">
							<NavItem eventKey={3}>
								{translate('HEADER_myProfile')}
							</NavItem>
						</LinkContainer>
						<LinkContainer to="/events/me">
							<NavItem eventKey={4}>
								{translate('HEADER_myEvents')}
							</NavItem>
						</LinkContainer>
						<LinkContainer to="/events/1">
							<NavItem eventKey={5}>
								{translate('HEADER_explore')}
							</NavItem>
						</LinkContainer>
						<LinkContainer to="/help">
							<NavItem eventKey={6}>
								{translate('HEADER_help')}
							</NavItem>
						</LinkContainer>

						<LanguageMenu
				        	currentLanguage={this.state.translator.getLocale()}
				        	onSelect={this.state.onLanguageSelect} />
					</Nav>
				</Navbar.Collapse>
			</Navbar>
		);
	}
}