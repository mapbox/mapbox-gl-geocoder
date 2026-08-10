'use strict';

var utils = require('./utils');

// An integer or a decimal with at least one fractional digit, optionally signed.
const NUMBER = '-?\\d+(?:\\.\\d+)?';

const COMMA_SEPARATED_LNG_LAT_ZOOM_RGX = new RegExp('^(' + NUMBER + '),(' + NUMBER + '),(' + NUMBER + ')$');
const SLASH_SEPARATED_ZOOM_LAT_LNG_RGX = new RegExp('^(' + NUMBER + ')\\/(' + NUMBER + ')\\/(' + NUMBER + ')$');
const TILE_RGX = /^(\d+)\/(\d+)\/(\d+)$/;

function isValidLng(value) {
  return value >= -180 && value <= 180;
}

function isValidLat(value) {
  return value >= -90 && value <= 90;
}

function isValidZoom(zoom) {
  return zoom >= 0 && zoom <= utils.MAX_SPATIAL_ZOOM;
}

/**
 * Builds the synthetic feature for a recognized spatial format. `center` and
 * `geometry.coordinates` are both set so the feature needs no special handling in
 * `_fly`, `_handleMarker` or `options.getItemValue`.
 * @private
 * @param {Object} params
 * @param {number} params.lng
 * @param {number} params.lat
 * @param {number} params.zoom
 * @param {string} params.placeName
 * @param {string} params.searchQuery
 * @param {Object} params.properties
 * @returns {Object} a GeoJSON Feature
 */
function createFeature(params) {
  return {
    type: 'Feature',
    place_name: params.placeName,
    place_type: ['coordinate'],
    center: [params.lng, params.lat],
    geometry: {
      type: 'Point',
      coordinates: [params.lng, params.lat]
    },
    properties: params.properties,
    _zoom: params.zoom,
    _searchQuery: params.searchQuery
  };
}


/**
 * Recognizes input of the form `lng,lat,zoom` with no spaces, e.g. `6.925882,51.110352,11.31`.
 * @param {String} searchInput search input
 * @returns {Object|null} a GeoJSON Feature, or `null` if the input doesn't match
 */
function parseCommaSeparatedLngLatZoom(searchInput) {
  const match = searchInput.match(COMMA_SEPARATED_LNG_LAT_ZOOM_RGX);
  if (!match) {
    return null;
  }

  const lngStr = match[1];
  const latStr = match[2];
  const zoomStr = match[3];

  const lng = Number(lngStr);
  const lat = Number(latStr);
  const zoom = Number(zoomStr);

  if (!isValidLng(lng) || !isValidLat(lat) || !isValidZoom(zoom)) {
    return null;
  }

  return createFeature({
    lng: lng,
    lat: lat,
    zoom: zoom,
    placeName: 'Point,lng=' + lngStr + ' lat=' + latStr + ' zoom=' + zoomStr,
    searchQuery: searchInput,
    properties: {
      spatialFormat: 'commaSeparatedLngLatZoom'
    }
  });
}

/**
 * Recognizes input of the form `zoom/lat/lng` with no spaces, e.g. `11.31/51.110352/6.925882`.
 * @param {String} searchInput search input
 * @returns {Object|null} a GeoJSON Feature, or `null` if the input doesn't match
 */
function parseSlashSeparatedZoomLatLng(searchInput) {
  const match = searchInput.match(SLASH_SEPARATED_ZOOM_LAT_LNG_RGX);
  if (!match) {
    return null;
  }

  const zoomStr = match[1];
  const latStr = match[2];
  const lngStr = match[3];

  const zoom = Number(zoomStr);
  const lat = Number(latStr);
  const lng = Number(lngStr);

  if (!isValidZoom(zoom) || !isValidLat(lat) || !isValidLng(lng)) {
    return null;
  }

  return createFeature({
    lng: lng,
    lat: lat,
    zoom: zoom,
    placeName: 'Point,lng=' + lngStr + ' lat=' + latStr + ' zoom=' + zoomStr,
    searchQuery: searchInput,
    properties: {
      spatialFormat: 'slashSeparatedZoomLatLng'
    }
  });
}

/**
 * Recognizes XYZ tile coordinates of the form `z/x/y`, e.g. `14/8507/5477`, and resolves them
 * to the center of the tile.
 * @param {String} searchInput search input
 * @returns {Object|null} a GeoJSON Feature, or `null` if the input doesn't match
 */
function parseTile(searchInput) {
  const match = searchInput.match(TILE_RGX);
  if (!match) {
    return null;
  }

  const z = Number(match[1]);
  const x = Number(match[2]);
  const y = Number(match[3]);

  if (!utils.isValidTile(z, x, y)) {
    return null;
  }

  const center = utils.tileToLngLat(z, x, y);

  return createFeature({
    lng: center[0],
    lat: center[1],
    zoom: z,
    placeName: 'Tile,x=' + x + ' y=' + y + ' z=' + z,
    searchQuery: searchInput,
    properties: {
      spatialFormat: 'tile',
      tile: { z: z, x: x, y: y }
    }
  });
}

/**
 * Recognizes a quadkey, e.g. `12020332200123`, and resolves it to the center of the quadkey.
 * @param {String} searchInput search input
 * @returns {Object|null} a GeoJSON Feature, or `null` if the input doesn't match
 */
function parseQuadkey(searchInput) {
  if (!utils.isValidQuadkey(searchInput)) {
    return null;
  }

  const qk = searchInput;
  const parsedTile = utils.quadkeyToTile(qk);
  const center = utils.tileToLngLat(parsedTile.z, parsedTile.x, parsedTile.y);

  return createFeature({
    lng: center[0],
    lat: center[1],
    zoom: parsedTile.z,
    placeName: 'Quadkey,' + qk,
    searchQuery: searchInput,
    properties: {
      spatialFormat: 'quadkey',
      quadkey: qk
    }
  });
}

module.exports = {
  parseCommaSeparatedLngLatZoom: parseCommaSeparatedLngLatZoom,
  parseSlashSeparatedZoomLatLng: parseSlashSeparatedZoomLatLng,
  parseTile: parseTile,
  parseQuadkey: parseQuadkey,
};
