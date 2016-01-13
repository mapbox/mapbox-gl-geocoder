'use strict';

var test = require('tape');
window.mapboxgl = require('mapbox-gl');
require('../');

mapboxgl.accessToken = process.env.MapboxAccessToken;

// Tests
require('./test.geocoder');
require('./test.ui');

// close the smokestack window once tests are complete
test('shutdown', (t) => {
  t.end();
  setTimeout(() => {
    window.close();
  });
});
