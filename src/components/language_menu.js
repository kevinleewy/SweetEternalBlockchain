import React, { Component } from 'react';
import { NavDropdown, MenuItem, SplitButton } from 'react-bootstrap';

const LANGUAGE = {
	'de' : 'Deutsch',
	'en' : 'English',
	'es' : 'Español',
	'fa' : 'فارسی',
	'fr' : 'français',
	'hi' : 'हिन्दी, हिंदी',
	'ja' : '日本語',
	'ko' : '한국어',
	'ms' : 'Bahasa Melayu',
	'pt' : 'Português',
	'th' : 'ไทย',
	'zh' : '中文'
}

export default class LanguageMenu extends Component {
	constructor(props) {
		super(props)

		this.state = {
			currentLanguage: props.currentLanguage,
			onSelect: props.onSelect
		}
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			currentLanguage: nextProps.currentLanguage
		});
	}

	render() {

		const onSelect = this.state.onSelect;
		const menuItems = Object.keys(LANGUAGE).map( key => {
			return <MenuItem key={key} eventKey={key} onSelect={onSelect}>{ LANGUAGE[key] }</MenuItem>;
		});
		return (
			<NavDropdown
				eventKey={6} 
				title={ LANGUAGE[this.state.currentLanguage] }
				id="language-nav-dropdown"
			>
	        	{menuItems}
	        </NavDropdown>
		);
	}
}