import React from 'react';
import GoogleMapReact from 'google-map-react';

export default ({ lat, lng, onClick }) => {
	return (
		<div style={{ height: '20vh', width: '250px' }}>
			<GoogleMapReact
	        	bootstrapURLKeys={{ key: "key" }}
	        	center={{lat, lng}}
	        	defaultZoom={16}
	        	onClick={onClick}>
	        </GoogleMapReact>
        </div>
	);
}