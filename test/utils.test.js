var test = require('tape');
var utils = require('../lib/utils');

test('REVERSE_GEOCODE_COORD_RGX', function (t) {
  t.ok(utils.REVERSE_GEOCODE_COORD_RGX.test('12, 34'), 'Reverse: "12, 34"');
  t.ok(utils.REVERSE_GEOCODE_COORD_RGX.test('1,2'), 'Reverse: "1,2"');
  t.ok(utils.REVERSE_GEOCODE_COORD_RGX.test('12.123, 34.345'), 'Reverse: "12.123, 34.345"');
  t.ok(utils.REVERSE_GEOCODE_COORD_RGX.test('12, 34.345'), 'Reverse: "12, 34.345"');
  t.ok(utils.REVERSE_GEOCODE_COORD_RGX.test('12., 34.'), 'Reverse: "12., 34."');
  t.ok(utils.REVERSE_GEOCODE_COORD_RGX.test('122, 41'), 'Reverse: "122, 41"');
  t.ok(utils.REVERSE_GEOCODE_COORD_RGX.test('12, 123'), 'Reverse: "12, 123"');
  t.ok(utils.REVERSE_GEOCODE_COORD_RGX.test('1234, 4568'), 'Reverse: "1234, 4568" (no numeric range check, matches API behavior)');
  t.ok(utils.REVERSE_GEOCODE_COORD_RGX.test('12.45, 12345456'), 'Reverse: "12.45, 12345456" (out-of-range values are still coordinate-shaped)');
  t.ok(utils.REVERSE_GEOCODE_COORD_RGX.test('12.55,34.87'), 'Reverse: "12.55,34.87" (no space around comma)');
  t.ok(utils.REVERSE_GEOCODE_COORD_RGX.test('12.55 , 34.87'), 'Reverse: "12.55 , 34.87" (space before and after comma)');
  t.notOk(utils.REVERSE_GEOCODE_COORD_RGX.test('12.55 34.87'), 'Forward: "12.55 34.87" (no comma, only whitespace-separated)');
  t.notOk(utils.REVERSE_GEOCODE_COORD_RGX.test('123 Main'), 'Forward: "123 Main"');
  t.end();
});

// Math.sinh/Math.atan precision is implementation-defined, so compare coordinates
// with a tolerance instead of asserting exact float equality.
function assertLngLat(t, actual, expected, msg) {
  t.ok(
    Math.abs(actual[0] - expected[0]) < 1e-9 && Math.abs(actual[1] - expected[1]) < 1e-9,
    msg + ' (got [' + actual[0] + ', ' + actual[1] + '])'
  );
}

test('isValidTile', function (t) {
  t.ok(utils.isValidTile(0, 0, 0), 'z=0: 0/0/0 is the only valid tile');
  t.notOk(utils.isValidTile(0, 1, 0), 'z=0: x=1 is outside the 1x1 grid');
  t.ok(utils.isValidTile(1, 1, 1), 'z=1: 1/1 is the last tile of the 2x2 grid');
  t.notOk(utils.isValidTile(1, 2, 1), 'z=1: x=2 is outside the 2x2 grid');
  t.notOk(utils.isValidTile(1, 1, 2), 'z=1: y=2 is outside the 2x2 grid');
  t.ok(utils.isValidTile(14, 8507, 5477), 'z=14: 8507/5477 is inside the grid');
  t.notOk(utils.isValidTile(14, 16384, 5477), 'z=14: x=2^14 is outside the grid');
  t.ok(utils.isValidTile(24, Math.pow(2, 24) - 1, Math.pow(2, 24) - 1), 'z=24: last tile of the grid');
  t.notOk(utils.isValidTile(25, 0, 0), 'z=25 is above the supported maximum');
  t.notOk(utils.isValidTile(-1, 0, 0), 'z=-1 is below zero');
  t.notOk(utils.isValidTile(14, -1, 0), 'x=-1 is below zero');
  t.notOk(utils.isValidTile(14, 0, -1), 'y=-1 is below zero');
  t.notOk(utils.isValidTile(14.5, 10, 10), 'z must be an integer');
  t.notOk(utils.isValidTile(14, 10.5, 10), 'x must be an integer');
  t.notOk(utils.isValidTile(14, 10, 10.5), 'y must be an integer');
  t.end();
});

test('isValidQuadkey', function (t) {
  t.ok(utils.isValidQuadkey('12020332200123'), 'valid 14-character quadkey');
  t.ok(utils.isValidQuadkey('0'), 'single-digit quadkey');
  t.ok(utils.isValidQuadkey('0123'), 'a leading zero is significant, not invalid');
  t.ok(utils.isValidQuadkey('000000000000000000000000'), '24 characters is the supported maximum');
  t.notOk(utils.isValidQuadkey('0000000000000000000000000'), '25 characters is above the supported maximum');
  t.notOk(utils.isValidQuadkey(''), 'empty string is not a quadkey');
  t.notOk(utils.isValidQuadkey('1204'), 'digit 4 is outside the base-4 alphabet');
  t.notOk(utils.isValidQuadkey('120a'), 'non-digit characters are rejected');
  t.notOk(utils.isValidQuadkey('12 03'), 'whitespace is rejected');
  t.notOk(utils.isValidQuadkey(1203), 'a number is not a quadkey');
  t.end();
});

test('tileToLngLat', function (t) {
  t.deepEqual(utils.tileToLngLat(0, 0, 0), [0, 0], 'z=0 covers the world, its center is null island');
  assertLngLat(t, utils.tileToLngLat(14, 8507, 5477), [6.932373046875, 51.10352194240417], 'z=14 tile center');
  assertLngLat(t, utils.tileToLngLat(1, 0, 0), [-90, 66.51326044311186], 'z=1 north-west tile center');
  t.end();
});

test('quadkeyToTile', function (t) {
  t.deepEqual(utils.quadkeyToTile('12020332200123'), { z: 14, x: 8581, y: 5603 }, '14-character quadkey');
  t.deepEqual(utils.quadkeyToTile('213'), { z: 3, x: 3, y: 5 }, '3-character quadkey');
  t.deepEqual(utils.quadkeyToTile('0'), { z: 1, x: 0, y: 0 }, 'single-digit quadkey');
  t.deepEqual(utils.quadkeyToTile('3'), { z: 1, x: 1, y: 1 }, 'single-digit quadkey, south-east quadrant');
  t.end();
});
