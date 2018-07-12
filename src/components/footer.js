import React from 'react';
import { Link } from 'react-router-dom';
import { Grid, Row, Col} from 'react-bootstrap';
import { SocialIcon } from 'react-social-icons';


export default (props) => {
	return (
		<Grid id="footer">
			<Row id="footerContent">
				<Col xs={2} sm={2} md={1}>
				</Col>
				<Col xs={8} sm={12} md={6}>
					<h4>Content Title</h4>
					<hr />
					<p>Content Description</p>
				</Col>
				<Col xs={12} sm={6} md={2}>
					<ul className="list-unstyled">
						<li><h4>More Information</h4></li>
						<hr />
						<li><Link to="/about">About Us</Link></li>
						<li><Link to="/team">The Team</Link></li>
						<li><Link to="/roadmap">Roadmap</Link></li>
						<li><a href="/whitepaper">Whitepaper</a></li>
						<li><a href="/media">Media</a></li>
						<li><a href="/blog">Blog</a></li>
					</ul>
				</Col>
				<Col xs={12} sm={6} md={2}>
					<ul className="list-unstyled">
						<li><h4>Legal</h4></li>
						<hr />
						<li><Link to="/tnc">Terms and Conditions</Link></li>
						<li><Link to="/privacy">Privacy Policy</Link></li>
					</ul>
				</Col>
				<Col xs={2} sm={2} md={1}>
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