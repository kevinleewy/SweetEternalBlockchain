import React from 'react';
import { Link } from 'react-router-dom';
import { Grid, Row, Col} from 'react-bootstrap';
import { SocialIcon } from 'react-social-icons';


export default (props) => {
	return (
		<Grid id="footer">
			<Row id="footerContent">
				<Col sm={2} md={1}>
				</Col>
				<Col sm={12} md={6}>
					<h4>Content Title</h4>
					<hr />
					<p>Content Description</p>
				</Col>
				<Col sm={4} md={2}>
					<ul className="list-unstyled">
						<li><h4>Header 1</h4></li>
						<hr />
						<li><a href="/link1">Link 1</a></li>
						<li><a href="/link2">Link 2</a></li>
					</ul>
				</Col>
				<Col sm={4} md={2}>
					<ul className="list-unstyled">
						<li><h4>Header 2</h4></li>
						<hr />
						<li><a href="/link3">Link 3</a></li>
						<li><a href="/link4">Link 4</a></li>
					</ul>
				</Col>
				<Col sm={2} md={1}>
				</Col>
			</Row>
			<Row id="callToAction">
				<h4>Create an event today!</h4>
				<Link to="/events/create" className="btn btn-primary">Let's Go!</Link>
			</Row>
			<Row id="socialMedia">
				<SocialIcon url="https://www.facebook.com/sweeteternal/" />
				<SocialIcon url="http://twitter.com/sweeteternal" />
				<SocialIcon url="http://instagram.com/sweeteternal" />
			</Row>
		</Grid>
	);
}