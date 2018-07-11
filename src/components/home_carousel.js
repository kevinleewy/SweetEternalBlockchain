import React from 'react';
import { Carousel } from 'react-bootstrap';

import wallpaper1 from '../assets/images/wallpaper/home_wallpaper_1.jpg';
import wallpaper2 from '../assets/images/wallpaper/home_wallpaper_2.jpg';

export default (props) => {
	return (
		<Carousel>
			<Carousel.Item>
				<img width="100%" alt="wallpaper.jpg" src={wallpaper1} />
				<Carousel.Caption>
					<h2>Sweet Eternal</h2>
					<h4>Memories on the Blockchain</h4>
					<p>Powered by Ethereum</p>
				</Carousel.Caption>
			</Carousel.Item>
			<Carousel.Item>
				<img width="100%" alt="wallpaper.jpg" src={wallpaper2} />
				<Carousel.Caption>
					<h2>Sweet Eternal</h2>
					<h4>Memories on the Blockchain</h4>
					<p>Powered by Ethereum</p>
				</Carousel.Caption>
			</Carousel.Item>
		</Carousel>
	);
}