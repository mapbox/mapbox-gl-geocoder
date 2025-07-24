import {test, expect} from 'vitest';

import * as utils from '../lib/utils.js';

test('REVERSE_GEOCODE_COORD_RGX', function () {
  // Reverse: "12, 34"
  expect(utils.REVERSE_GEOCODE_COORD_RGX.test('12, 34')).toBeTruthy();
  // Reverse: "1,2"
  expect(utils.REVERSE_GEOCODE_COORD_RGX.test('1,2')).toBeTruthy();
  // Reverse: "12.123, 34.345"
  expect(utils.REVERSE_GEOCODE_COORD_RGX.test('12.123, 34.345')).toBeTruthy();
  // Reverse: "12, 34.345"
  expect(utils.REVERSE_GEOCODE_COORD_RGX.test('12, 34.345')).toBeTruthy();
  // Reverse: "12., 34."
  expect(utils.REVERSE_GEOCODE_COORD_RGX.test('12., 34.')).toBeTruthy();
  // Reverse: "122, 41"
  expect(utils.REVERSE_GEOCODE_COORD_RGX.test('122, 41')).toBeTruthy();
  // Reverse: "12, 123"
  expect(utils.REVERSE_GEOCODE_COORD_RGX.test('12, 123')).toBeTruthy();
  // Forward: "1234, 4568"
  expect(utils.REVERSE_GEOCODE_COORD_RGX.test('1234, 4568')).toBeFalsy();
  // Forward: "123 Main"
  expect(utils.REVERSE_GEOCODE_COORD_RGX.test('123 Main')).toBeFalsy();
})