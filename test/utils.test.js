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
})