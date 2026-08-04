'use strict';

var test = require('tape');
var spatialFormats = require('../lib/spatial-formats');

var ALL_ENABLED = {
  commaSeparatedLngLatZoom: true,
  slashSeparatedZoomLatLng: true,
  tile: true,
  quadkey: true
};

function placeNames(features) {
  return features.map(function (feature) {
    return feature.place_name;
  });
}

function assertLngLat(t, actual, expected, msg) {
  t.ok(
    Math.abs(actual[0] - expected[0]) < 1e-9 && Math.abs(actual[1] - expected[1]) < 1e-9,
    msg + ' (got [' + actual[0] + ', ' + actual[1] + '])'
  );
}

test('spatial-formats: commaSeparatedLngLatZoom', function (t) {
  var formatOptions = { commaSeparatedLngLatZoom: true };
  var features = spatialFormats.parse('6.925882,51.110352,11.31', formatOptions);

  t.equal(features.length, 1, 'one feature');
  t.equal(features[0].place_name, 'Point,lng=6.925882 lat=51.110352 zoom=11.31', 'place_name echoes the input');
  t.deepEqual(features[0].center, [6.925882, 51.110352], 'center is [lng, lat]');
  t.equal(features[0]._zoom, 11.31, 'a fractional zoom is preserved');
  t.equal(features[0].properties.spatialFormat, 'commaSeparatedLngLatZoom', 'the format is recorded');

  t.equal(spatialFormats.parse('-6,-51,0', formatOptions).length, 1, 'negative values and zoom 0 are accepted');
  t.equal(spatialFormats.parse('180,90,24', formatOptions).length, 1, 'the range boundaries are inclusive');
  t.deepEqual(spatialFormats.parse('181,51,11', formatOptions), [], 'lng above 180');
  t.deepEqual(spatialFormats.parse('6,91,11', formatOptions), [], 'lat above 90');
  t.deepEqual(spatialFormats.parse('6,51,25', formatOptions), [], 'zoom above 24');
  t.deepEqual(spatialFormats.parse('6,51,-1', formatOptions), [], 'negative zoom');
  t.deepEqual(spatialFormats.parse('6, 51, 11', formatOptions), [], 'spaces around commas are not accepted');
  t.deepEqual(spatialFormats.parse('6,51', formatOptions), [], 'two numbers are not enough');
  t.deepEqual(spatialFormats.parse('6,51,11,2', formatOptions), [], 'four numbers are too many');
  t.end();
});

test('spatial-formats: slashSeparatedZoomLatLng', function (t) {
  var formatOptions = { slashSeparatedZoomLatLng: true };
  var features = spatialFormats.parse('11.31/51.110352/6.925882', formatOptions);

  t.equal(features.length, 1, 'one feature');
  t.equal(features[0].place_name, 'Point,lng=6.925882 lat=51.110352 zoom=11.31', 'place_name is reordered to lng, lat, zoom');
  t.deepEqual(features[0].center, [6.925882, 51.110352], 'center is [lng, lat]');
  t.equal(features[0]._zoom, 11.31, 'zoom comes from the first component');
  t.equal(features[0].properties.spatialFormat, 'slashSeparatedZoomLatLng', 'the format is recorded');

  t.deepEqual(spatialFormats.parse('25/51/6', formatOptions), [], 'zoom above 24');
  t.deepEqual(spatialFormats.parse('11/91/6', formatOptions), [], 'lat above 90');
  t.deepEqual(spatialFormats.parse('11/51/181', formatOptions), [], 'lng above 180');
  t.deepEqual(spatialFormats.parse('14/8507/5477', formatOptions), [], 'tile coordinates are out of lat/lng range');
  t.deepEqual(spatialFormats.parse('11 / 51 / 6', formatOptions), [], 'spaces around slashes are not accepted');
  t.end();
});

test('spatial-formats: tile', function (t) {
  var formatOptions = { tile: true };
  var features = spatialFormats.parse('14/8507/5477', formatOptions);

  t.equal(features.length, 1, 'one feature');
  t.equal(features[0].place_name, 'Tile,x=8507 y=5477 z=14', 'place_name lists x, y, z');
  t.equal(features[0]._zoom, 14, 'zoom is the tile zoom');
  t.deepEqual(features[0].properties.tile, { z: 14, x: 8507, y: 5477 }, 'the tile components are exposed');
  t.equal(features[0].properties.spatialFormat, 'tile', 'the format is recorded');
  assertLngLat(t, features[0].center, [6.932373046875, 51.10352194240417], 'center is the tile center');

  t.equal(spatialFormats.parse('0/0/0', formatOptions).length, 1, 'the z=0 world tile is valid');
  t.deepEqual(spatialFormats.parse('14/16384/5477', formatOptions), [], 'x is outside the z=14 grid');
  t.deepEqual(spatialFormats.parse('25/0/0', formatOptions), [], 'zoom above 24');
  t.deepEqual(spatialFormats.parse('14/8507.5/5477', formatOptions), [], 'components must be integers');
  t.deepEqual(spatialFormats.parse('14/-1/5477', formatOptions), [], 'negative components are rejected');
  t.equal(spatialFormats.parse('014/8507/5477', formatOptions).length, 1, 'leading zeros are accepted');
  t.equal(
    spatialFormats.parse('014/8507/5477', formatOptions)[0].place_name,
    'Tile,x=8507 y=5477 z=14',
    'leading zeros are normalized away in place_name'
  );
  t.end();
});

test('spatial-formats: quadkey', function (t) {
  var formatOptions = { quadkey: true };
  var features = spatialFormats.parse('12020332200123',formatOptions);

  t.equal(features.length, 1, 'one feature');
  t.equal(features[0].place_name, 'Quadkey,12020332200123', 'place_name echoes the quadkey');
  t.equal(features[0]._zoom, 14, 'zoom is the quadkey length');
  t.equal(features[0].properties.quadkey, '12020332200123', 'the quadkey is exposed');
  t.equal(features[0].properties.spatialFormat, 'quadkey', 'the format is recorded');
  assertLngLat(t, features[0].center, [8.558349609375, 49.33228198473772], 'center is the tile center');

  t.equal(spatialFormats.parse('0123',formatOptions).length, 1, 'a leading zero is a valid quadkey');
  t.equal(spatialFormats.parse('0123',formatOptions)[0]._zoom, 4, 'the leading zero counts towards the zoom');
  t.deepEqual(spatialFormats.parse('12345',formatOptions), [], 'digits above 3 are not a quadkey');
  t.deepEqual(spatialFormats.parse('12 0203',formatOptions), [], 'whitespace is not accepted');
  t.deepEqual(spatialFormats.parse('abc',formatOptions), [], 'letters are not accepted');
  t.end();
});

test('spatial-formats: feature shape', function (t) {
  var feature = spatialFormats.parse('6.925882,51.110352,11.31', { commaSeparatedLngLatZoom: true })[0];
  t.equal(feature.type, 'Feature', 'is a GeoJSON Feature');
  t.deepEqual(feature.place_type, ['coordinate'], 'place_type is coordinate');
  t.equal(feature.geometry.type, 'Point', 'has a point geometry');
  t.deepEqual(feature.geometry.coordinates, feature.center, 'geometry coordinates match center');
  t.equal(feature._source, 'extended-spatial-format', 'is tagged with the extended spatial format source');
  t.equal(feature.bbox, undefined, 'has no bbox, so _fly uses center and _zoom');
  t.end();
});

test('spatial-formats: ambiguous z/a/b input yields both interpretations', function (t) {
  t.deepEqual(placeNames(spatialFormats.parse('12/45/30', ALL_ENABLED)), [
    'Tile,x=45 y=30 z=12',
    'Point,lng=30 lat=45 zoom=12'
  ], 'the tile interpretation comes first, then lat/lng');

  t.deepEqual(
    placeNames(spatialFormats.parse('12/45/30', { tile: true })),
    ['Tile,x=45 y=30 z=12'],
    'only an enabled format contributes'
  );
  t.deepEqual(
    placeNames(spatialFormats.parse('12/45.5/30', ALL_ENABLED)),
    ['Point,lng=30 lat=45.5 zoom=12'],
    'a decimal component rules out the tile interpretation'
  );
  t.deepEqual(
    placeNames(spatialFormats.parse('14/8507/5477', ALL_ENABLED)),
    ['Tile,x=8507 y=5477 z=14'],
    'an out-of-range latitude rules out the lat/lng interpretation'
  );
  t.equal(spatialFormats.parse('6.925882,51.110352,11.31', ALL_ENABLED).length, 1, 'a comma-separated triple only ever matches one format');
  t.equal(spatialFormats.parse('12020332200123', ALL_ENABLED).length, 1, 'a quadkey only ever matches one format');
  t.end();
});

test('spatial-formats: every format is opt-in', function (t) {
  var inputs = [
    '6.925882,51.110352,11.31',
    '11.31/51.110352/6.925882',
    '14/8507/5477',
    '12020332200123'
  ];

  var formatOptions = {
    commaSeparatedLngLatZoom: false,
    slashSeparatedZoomLatLng: false,
    tile: false,
    quadkey: false
  }

  inputs.forEach(function (input) {
    t.deepEqual(spatialFormats.parse(input, formatOptions), [], 'no feature for "' + input + '" when all formats are disabled');
    t.deepEqual(spatialFormats.parse(input, undefined), [], 'no feature for "' + input + '" without format options');
  });

  t.deepEqual(spatialFormats.parse('Berlin', ALL_ENABLED), [], 'ordinary text never matches');
  t.deepEqual(spatialFormats.parse('', ALL_ENABLED), [], 'empty input never matches');
  t.deepEqual(spatialFormats.parse('48.774989, 9.155557', ALL_ENABLED), [], 'plain reverse-geocode coordinates never match');
  t.end();
});
