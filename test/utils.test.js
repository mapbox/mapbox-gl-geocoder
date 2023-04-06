import test from 'tape';
import * as utils from '../lib/utils.js';

test('REVERSE_GEOCODE_COORD_RGX', function (t) {
  t.ok(utils.REVERSE_GEOCODE_COORD_RGX.test('12, 34'), 'Reverse: "12, 34"');
  t.ok(utils.REVERSE_GEOCODE_COORD_RGX.test('1,2'), 'Reverse: "1,2"');
  t.ok(utils.REVERSE_GEOCODE_COORD_RGX.test('12.123, 34.345'), 'Reverse: "12.123, 34.345"');
  t.ok(utils.REVERSE_GEOCODE_COORD_RGX.test('12, 34.345'), 'Reverse: "12, 34.345"');
  t.ok(utils.REVERSE_GEOCODE_COORD_RGX.test('12., 34.'), 'Reverse: "12., 34."');
  t.ok(utils.REVERSE_GEOCODE_COORD_RGX.test('122, 41'), 'Reverse: "122, 41"');
  t.ok(utils.REVERSE_GEOCODE_COORD_RGX.test('12, 123'), 'Reverse: "12, 123"');
  t.notOk(utils.REVERSE_GEOCODE_COORD_RGX.test('1234, 4568'), 'Forward: "1234, 4568"');
  t.notOk(utils.REVERSE_GEOCODE_COORD_RGX.test('123 Main'), 'Forward: "123 Main"');
})