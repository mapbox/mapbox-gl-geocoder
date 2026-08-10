'use strict';

var test = require('tape');
var spatialFormats = require('../lib/spatial-formats');

function assertLngLat(t, actual, expected, msg) {
  t.ok(
    Math.abs(actual[0] - expected[0]) < 1e-9 && Math.abs(actual[1] - expected[1]) < 1e-9,
    msg + ' (got [' + actual[0] + ', ' + actual[1] + '])'
  );
}

test('spatial-formats: commaSeparatedLngLatZoom', function (t) {
  var feature = spatialFormats.parseCommaSeparatedLngLatZoom('6.925882,51.110352,11.31');

  t.equal(feature.place_name, 'Point,lng=6.925882 lat=51.110352 zoom=11.31', 'place_name echoes the input');
  t.deepEqual(feature.center, [6.925882, 51.110352], 'center is [lng, lat]');
  t.equal(feature._zoom, 11.31, 'a fractional zoom is preserved');
  t.equal(feature.properties.spatialFormat, 'commaSeparatedLngLatZoom', 'the format is recorded');

  t.ok(spatialFormats.parseCommaSeparatedLngLatZoom('-6,-51,0'), 'negative values and zoom 0 are accepted');
  t.ok(spatialFormats.parseCommaSeparatedLngLatZoom('180,90,24'), 'the range boundaries are inclusive');
  t.equal(spatialFormats.parseCommaSeparatedLngLatZoom('181,51,11'), null, 'lng above 180');
  t.equal(spatialFormats.parseCommaSeparatedLngLatZoom('6,91,11'), null, 'lat above 90');
  t.equal(spatialFormats.parseCommaSeparatedLngLatZoom('6,51,25'), null, 'zoom above 24');
  t.equal(spatialFormats.parseCommaSeparatedLngLatZoom('6,51,-1'), null, 'negative zoom');
  t.equal(spatialFormats.parseCommaSeparatedLngLatZoom('6, 51, 11'), null, 'spaces around commas are not accepted');
  t.equal(spatialFormats.parseCommaSeparatedLngLatZoom('6,51'), null, 'two numbers are not enough');
  t.equal(spatialFormats.parseCommaSeparatedLngLatZoom('6,51,11,2'), null, 'four numbers are too many');
  t.end();
});

test('spatial-formats: slashSeparatedZoomLatLng', function (t) {
  var feature = spatialFormats.parseSlashSeparatedZoomLatLng('11.31/51.110352/6.925882');

  t.equal(feature.place_name, 'Point,lng=6.925882 lat=51.110352 zoom=11.31', 'place_name is reordered to lng, lat, zoom');
  t.deepEqual(feature.center, [6.925882, 51.110352], 'center is [lng, lat]');
  t.equal(feature._zoom, 11.31, 'zoom comes from the first component');
  t.equal(feature.properties.spatialFormat, 'slashSeparatedZoomLatLng', 'the format is recorded');

  t.equal(spatialFormats.parseSlashSeparatedZoomLatLng('25/51/6'), null, 'zoom above 24');
  t.equal(spatialFormats.parseSlashSeparatedZoomLatLng('11/91/6'), null, 'lat above 90');
  t.equal(spatialFormats.parseSlashSeparatedZoomLatLng('11/51/181'), null, 'lng above 180');
  t.equal(spatialFormats.parseSlashSeparatedZoomLatLng('14/8507/5477'), null, 'tile coordinates are out of lat/lng range');
  t.equal(spatialFormats.parseSlashSeparatedZoomLatLng('11 / 51 / 6'), null, 'spaces around slashes are not accepted');
  t.end();
});

test('spatial-formats: tile', function (t) {
  var feature = spatialFormats.parseTile('14/8507/5477');

  t.equal(feature.place_name, 'Tile,x=8507 y=5477 z=14', 'place_name lists x, y, z');
  t.equal(feature._zoom, 14, 'zoom is the tile zoom');
  t.deepEqual(feature.properties.tile, { z: 14, x: 8507, y: 5477 }, 'the tile components are exposed');
  t.equal(feature.properties.spatialFormat, 'tile', 'the format is recorded');
  assertLngLat(t, feature.center, [6.932373046875, 51.10352194240417], 'center is the tile center');

  t.ok(spatialFormats.parseTile('0/0/0'), 'the z=0 world tile is valid');
  t.equal(spatialFormats.parseTile('14/16384/5477'), null, 'x is outside the z=14 grid');
  t.equal(spatialFormats.parseTile('25/0/0'), null, 'zoom above 24');
  t.equal(spatialFormats.parseTile('14/8507.5/5477'), null, 'components must be integers');
  t.equal(spatialFormats.parseTile('14/-1/5477'), null, 'negative components are rejected');
  t.ok(spatialFormats.parseTile('014/8507/5477'), 'leading zeros are accepted');
  t.equal(
    spatialFormats.parseTile('014/8507/5477').place_name,
    'Tile,x=8507 y=5477 z=14',
    'leading zeros are normalized away in place_name'
  );
  t.end();
});

test('spatial-formats: quadkey', function (t) {
  var feature = spatialFormats.parseQuadkey('12020332200123');

  t.equal(feature.place_name, 'Quadkey,12020332200123', 'place_name echoes the quadkey');
  t.equal(feature._zoom, 14, 'zoom is the quadkey length');
  t.equal(feature.properties.quadkey, '12020332200123', 'the quadkey is exposed');
  t.equal(feature.properties.spatialFormat, 'quadkey', 'the format is recorded');
  assertLngLat(t, feature.center, [8.558349609375, 49.33228198473772], 'center is the tile center');

  t.ok(spatialFormats.parseQuadkey('0123'), 'a leading zero is a valid quadkey');
  t.equal(spatialFormats.parseQuadkey('0123')._zoom, 4, 'the leading zero counts towards the zoom');
  t.equal(spatialFormats.parseQuadkey('12345'), null, 'digits above 3 are not a quadkey');
  t.equal(spatialFormats.parseQuadkey('12 0203'), null, 'whitespace is not accepted');
  t.equal(spatialFormats.parseQuadkey('abc'), null, 'letters are not accepted');
  t.end();
});

test('spatial-formats: feature shape', function (t) {
  var feature = spatialFormats.parseCommaSeparatedLngLatZoom('6.925882,51.110352,11.31');
  t.equal(feature.type, 'Feature', 'is a GeoJSON Feature');
  t.deepEqual(feature.place_type, ['coordinate'], 'place_type is coordinate');
  t.equal(feature.geometry.type, 'Point', 'has a point geometry');
  t.deepEqual(feature.geometry.coordinates, feature.center, 'geometry coordinates match center');
  t.equal(feature._searchQuery, '6.925882,51.110352,11.31', 'has initial searchInput value');
  t.equal(feature.bbox, undefined, 'has no bbox, so _fly uses center and _zoom');
  t.end();
});

test('spatial-formats: ambiguous z/a/b input matches both tile and slashSeparatedZoomLatLng', function (t) {
  t.equal(spatialFormats.parseTile('12/45/30').place_name, 'Tile,x=45 y=30 z=12', 'tile interpretation');
  t.equal(spatialFormats.parseSlashSeparatedZoomLatLng('12/45/30').place_name, 'Point,lng=30 lat=45 zoom=12', 'lat/lng interpretation');

  t.equal(spatialFormats.parseTile('12/45.5/30'), null, 'a decimal component rules out the tile interpretation');
  t.ok(spatialFormats.parseSlashSeparatedZoomLatLng('12/45.5/30'), 'the lat/lng interpretation still matches');

  t.ok(spatialFormats.parseTile('14/8507/5477'), 'the tile interpretation matches');
  t.equal(spatialFormats.parseSlashSeparatedZoomLatLng('14/8507/5477'), null, 'an out-of-range latitude rules out the lat/lng interpretation');

  t.end();
});

test('spatial-formats: ordinary text never matches', function (t) {
  t.equal(spatialFormats.parseCommaSeparatedLngLatZoom('Berlin'), null, 'commaSeparatedLngLatZoom');
  t.equal(spatialFormats.parseSlashSeparatedZoomLatLng('Berlin'), null, 'slashSeparatedZoomLatLng');
  t.equal(spatialFormats.parseTile('Berlin'), null, 'tile');
  t.equal(spatialFormats.parseQuadkey('Berlin'), null, 'quadkey');

  t.equal(spatialFormats.parseCommaSeparatedLngLatZoom(''), null, 'commaSeparatedLngLatZoom on empty input');
  t.equal(spatialFormats.parseSlashSeparatedZoomLatLng(''), null, 'slashSeparatedZoomLatLng on empty input');
  t.equal(spatialFormats.parseTile(''), null, 'tile on empty input');
  t.equal(spatialFormats.parseQuadkey(''), null, 'quadkey on empty input');

  t.equal(spatialFormats.parseCommaSeparatedLngLatZoom('48.774989, 9.155557'), null, 'plain reverse-geocode coordinates never match commaSeparatedLngLatZoom');
  t.end();
});
