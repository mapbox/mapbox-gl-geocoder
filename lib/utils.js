/**
 * This function transforms the feature from reverse geocoding to plain text with specified accuracy
 * @param {object} feature 
 * @param {string} accuracy 
 * @returns 
 */
function transformFeatureToGeolocationText(feature, accuracy) {
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
function getAddressInfo(feature) {
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

// Matches any two numbers separated by a comma (optionally surrounded by
// whitespace), with no bound on the numeric range. This mirrors how the
// Geocoding v5 API itself detects coordinate-like queries, so a string
// classified here as "coordinates" is always handled as a reverse geocode
// request, never split between forward/reverse.
const REVERSE_GEOCODE_COORD_RGX = /^(-?\d+(\.\d{0,256})?)\s*,\s*(-?\d+(\.\d{0,256})?)$/;

// Unanchored version of REVERSE_GEOCODE_COORD_RGX: checks that the string contains
// coordinates somewhere in it, regardless of surrounding punctuation/whitespace.
const RELAXED_COORD_RGX = /(-?\d+(\.\d{0,256})?)\s*,\s*(-?\d+(\.\d{0,256})?)/;

module.exports = {
  transformFeatureToGeolocationText: transformFeatureToGeolocationText,
  getAddressInfo: getAddressInfo,
  REVERSE_GEOCODE_COORD_RGX: REVERSE_GEOCODE_COORD_RGX,
  RELAXED_COORD_RGX: RELAXED_COORD_RGX,
}