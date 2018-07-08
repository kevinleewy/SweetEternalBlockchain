import React from 'react';
import GoogleMapReact from 'google-map-react';

export default ({ lat, lng, onClick }) => {
	return (
		<div style={{ height: '20vh', width: '30%' }}>
			<GoogleMapReact
	        	bootstrapURLKeys={{ key: "key" }}
	        	center={{lat, lng}}
	        	defaultZoom={12}
	        	onClick={onClick}>
	        </GoogleMapReact>
        </div>
	);
}