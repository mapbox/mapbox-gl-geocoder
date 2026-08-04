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

// Maximum zoom level accepted by the extended spatial input formats. It also
// caps quadkey length, since a quadkey holds one base-4 digit per zoom level.
const MAX_SPATIAL_ZOOM = 24;

/**
 * Checks whether a tile coordinate triple is valid: `z` must be a supported zoom
 * level and `x`/`y` must fall inside the 2^z x 2^z tile grid of that level.
 * @private
 * @param {Number} z zoom level
 * @param {Number} x tile column
 * @param {Number} y tile row
 * @returns {Boolean}
 */
function isValidTile(z, x, y) {
  if (!Number.isInteger(z) || !Number.isInteger(x) || !Number.isInteger(y)) {
    return false;
  }

  if (z < 0 || z > MAX_SPATIAL_ZOOM) {
    return false;
  }

  const maxIndex = Math.pow(2, z) - 1;

  return x >= 0 && x <= maxIndex && y >= 0 && y <= maxIndex;
}

/**
 * Checks whether a string is a valid quadkey. A quadkey holds one base-4 digit
 * per zoom level, so only the characters 0-3 are allowed and its length is the
 * zoom level it describes.
 * @private
 * @param {String} quadkey
 * @returns {Boolean}
 */
function isValidQuadkey(quadkey) {
  if (typeof quadkey !== 'string') {
    return false;
  }

  if (quadkey.length === 0 || quadkey.length > MAX_SPATIAL_ZOOM) {
    return false;
  }

  return /^[0-3]+$/.test(quadkey);
}

/**
 * Converts a tile coordinate to the longitude/latitude of the tile's center.
 * @private
 * @param {Number} z zoom level
 * @param {Number} x tile column
 * @param {Number} y tile row
 * @returns {Array<Number>} `[lng, lat]`
 */
function tileToLngLat(z, x, y) {
  const tilesPerAxis = Math.pow(2, z);
  const lng = ((x + 0.5) / tilesPerAxis) * 360 - 180;
  const latRadians = Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 0.5)) / tilesPerAxis)));

  return [lng, (latRadians * 180) / Math.PI];
}

/**
 * Converts a quadkey to its tile coordinate.
 * @private
 * @param {String} quadkey
 * @returns {Object} `{ z, x, y }`
 */
function quadkeyToTile(quadkey) {
  const z = quadkey.length;
  var x = 0;
  var y = 0;

  for (var i = z; i > 0; i--) {
    const mask = 1 << (i - 1);

    switch (quadkey.charAt(z - i)) {
    case '1':
      x |= mask;
      break;
    case '2':
      y |= mask;
      break;
    case '3':
      x |= mask;
      y |= mask;
      break;
    }
  }

  return { z: z, x: x, y: y };
}

module.exports = {
  transformFeatureToGeolocationText: transformFeatureToGeolocationText,
  getAddressInfo: getAddressInfo,
  REVERSE_GEOCODE_COORD_RGX: REVERSE_GEOCODE_COORD_RGX,
  RELAXED_COORD_RGX: RELAXED_COORD_RGX,
  MAX_SPATIAL_ZOOM: MAX_SPATIAL_ZOOM,
  isValidTile: isValidTile,
  isValidQuadkey: isValidQuadkey,
  tileToLngLat: tileToLngLat,
  quadkeyToTile: quadkeyToTile,
}