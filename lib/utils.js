/**
 * This function transforms the feature from reverse geocoding to plain text with specified accuracy
 * @param {object} feature 
 * @param {string} accuracy 
 * @returns 
 */
export function transformFeatureToGeolocationText(feature, accuracy) {
  const addrInfo = getAddressInfo(feature);

  const addressAccuracy =  ['address', 'street', 'place', 'country'];
  var currentAccuracy;

  if (typeof accuracy === 'function') {
    return accuracy(addrInfo)
  }

  const accuracyIndex = addressAccuracy.indexOf(accuracy);

  if (accuracyIndex === -1) {
    currentAccuracy = addressAccuracy;
  } else {
    currentAccuracy = addressAccuracy.slice(accuracyIndex);
  }

  return currentAccuracy.reduce(function(acc, name) {
    if (!addrInfo[name]) {
      return acc;
    }

    if (acc !== '') {
      acc = acc + ', ';
    }

    return acc + addrInfo[name];
  }, '');
}
/**
 * This function transforms the feature from reverse geocoding to AddressInfo object
 * @param {object} feature 
 * @returns {object}
 */
export function getAddressInfo(feature) {
  const houseNumber = feature.address || '';
  const street = feature.text || '';
  const placeName = feature.place_name || '';
  const address = placeName.split(',')[0];

  const addrInfo = {
    address: address,
    houseNumber: houseNumber,
    street: street,
    placeName: placeName,
  }

  feature.context.forEach(function (context) {
    const layer = context.id.split('.')[0];
    addrInfo[layer] = context.text;
  });

  return addrInfo;
}

export const REVERSE_GEOCODE_COORD_RGX = /^[ ]*(-?\d{1,3}(\.\d{0,256})?)[, ]+(-?\d{1,3}(\.\d{0,256})?)[ ]*$/;
