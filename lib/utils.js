/**
 * This function transforms the feature from reverse geocoding to plain text with specified accuracy
 * @param {object} feature 
 * @param {string} accuracy 
 * @param {'v5'|'v6'} version
 * @returns 
 */
function transformFeatureToGeolocationText(feature, accuracy, version) {
  const addrInfo = getAddressInfo(feature, version);

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
 * @param {'v5'|'v6'} version
 * @returns {object}
 */
function getAddressInfo(feature, version) {
  if(version === 'v6') {
    return getV6AddressInfo(feature);
  }
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

/**
 * This function transforms the v6 feature from reverse geocoding to AddressInfo object
 * @param {object} feature 
 * @returns {object}
 */
function getV6AddressInfo(feature) {
  const houseNumber = feature.address_number || "";
  const street = feature.street || "";
  const placeName = feature.name + (feature.place_formatted ? `, ${feature.place_formatted}` : "");
  const address = feature.name;

  const addrInfo = {
    address: address,
    houseNumber: houseNumber,
    street: street,
    placeName: placeName,
  };

  for (const contextProp in feature.context) {
    if (contextProp) {
      addrInfo[contextProp] = feature.context[contextProp].name;
    }
  }

  return addrInfo;
}

const REVERSE_GEOCODE_COORD_RGX = /^[ ]*(-?\d{1,3}(\.\d{0,256})?)[, ]+(-?\d{1,3}(\.\d{0,256})?)[ ]*$/;

module.exports = {
  transformFeatureToGeolocationText: transformFeatureToGeolocationText,
  getAddressInfo: getAddressInfo,
  REVERSE_GEOCODE_COORD_RGX: REVERSE_GEOCODE_COORD_RGX,
}