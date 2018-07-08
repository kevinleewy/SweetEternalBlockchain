export const contractLatitudeToActualLatitude = val => {
    return val / 10000.0 - 90.0;
}

export const contractLongitudeToActualLongitude = val => {
    return val / 10000.0 - 180.0;
}

export const actualLatitudeToContractLatitude = val => {
	if(typeof val === 'string'){
    	val = parseFloat(val);
    }
    return Math.round((val + 90) * 10000);
}

export const actualLongitudeToContractLongitude = val => {
	if(typeof val === 'string'){
    	val = parseFloat(val);
    }
    return Math.round((val + 180) * 10000);
}