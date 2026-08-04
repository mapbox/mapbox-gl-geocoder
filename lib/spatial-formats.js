'use strict';

var utils = require('./utils');

// Marks a feature synthesized from an extended spatial format, so it can be told
// apart from Geocoding API results (which carry `_source: 'mapbox'`).
const SOURCE = 'extended-spatial-format';

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
    _source: SOURCE,
    _searchQuery: params.searchQuery
  };
}


// Parsers for each known format.
// `tile` deliberately precedes `slashSeparatedZoomLatLng`
// because both accept `z/a/b`: an all-integer input that is also within
// latitude/longitude range (e.g. `12/45/30`) matches both, and the tile
// interpretation is listed first.
const FORMATS = [
  {
    name: 'commaSeparatedLngLatZoom',
    parse: function(searchInput) {
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
  },
  {
    name: 'tile',
    parse: function(searchInput) {
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
  },
  {
    name: 'slashSeparatedZoomLatLng',
    parse: function(searchInput) {
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
  },
  {
    name: 'quadkey',
    parse: function(searchInput) {
      if (!utils.isValidQuadkey(searchInput)) {
        return null;
      }

      const tile = utils.quadkeyToTile(searchInput);
      const center = utils.tileToLngLat(tile.z, tile.x, tile.y);

      return createFeature({
        lng: center[0],
        lat: center[1],
        zoom: tile.z,
        placeName: 'Quadkey,' + searchInput,
        searchQuery: searchInput,
        properties: {
          spatialFormat: 'quadkey',
          quadkey: searchInput
        }
      });
    }
  }
];

/**
 * Parses the search input against the enabled extended spatial formats.
 * @private
 * @param {String} searchInput search input
 * @param {Object} formatOptions
 * @param {Boolean} [formatOptions.commaSeparatedLngLatZoom] If `true`, recognize input of the form `lng,lat,zoom`
 * @param {Boolean} [formatOptions.slashSeparatedZoomLatLng] If `true`, recognize input of the form `zoom/lat/lng`
 * @param {Boolean} [formatOptions.tile] If `true`, recognize XYZ tile coordinates of the form `z/x/y`
 * @param {Boolean} [formatOptions.quadkey] If `true`, recognize a quadkey
 * @returns {Array<Object>} one feature per enabled format that matched, in the order the formats are declared; `[]` when nothing matched
 */
function parse(searchInput, formatOptions) {
  if (!formatOptions) {
    return [];
  }

  return FORMATS.reduce(function(features, format) {
    if (!formatOptions[format.name]) {
      return features;
    }

    const feature = format.parse(searchInput);
    if (feature) {
      features.push(feature);
    }

    return features;
  }, []);
}

module.exports = {
  parse: parse,
  SOURCE: SOURCE
};
