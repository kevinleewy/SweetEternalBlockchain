import React, { Component } from 'react';
import { MenuItem, Nav, Navbar, NavDropdown, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

//import reactLogo from '../logo.svg';
import logo from '../assets/images/sweet_eternal_logo_square_transparent.png';

export default class CreateEvent extends Component {
	constructor(props) {
		super(props)

		this.state = {
			onLanguageSelect: props.onLanguageSelect,
			translator: props.translator
		}
	}

	render() {
		const translate = this.state.translator.translate;
		const onSelect = this.state.onLanguageSelect;
		const menuItems = this.state.translator.getLocales().map( key => {
			return <MenuItem key={key} eventKey={key} onSelect={onSelect}>{ translate('HEADER_language', key) }</MenuItem>;
		});

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
						<LinkContainer to="/events/0">
							<NavItem eventKey={5}>
								{translate('HEADER_explore')}
							</NavItem>
						</LinkContainer>
						<LinkContainer to="/help">
							<NavItem eventKey={6}>
								{translate('HEADER_help')}
							</NavItem>
						</LinkContainer>

						<NavDropdown
							eventKey={7} 
							title={ translate('HEADER_language') }
							id="language-nav-dropdown"
						>
				        	{menuItems}
				        </NavDropdown>
					</Nav>
				</Navbar.Collapse>
			</Navbar>
		);
	}
}