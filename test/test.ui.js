'use strict';

var once = require('lodash.once');
var MapboxGeocoder = require('../');
var mapboxgl = require('mapbox-gl');
var test = require('tape');

mapboxgl.accessToken = process.env.MapboxAccessToken;

test('Geocoder#inputControl', function(tt) {
  var container, map, geocoder;

  var changeEvent = document.createEvent('HTMLEvents');
  changeEvent.initEvent('change', true, false);

  var clickEvent = document.createEvent('HTMLEvents');
  clickEvent.initEvent('click', true, false);

  function setup(opts) {
    opts = opts || {};
    opts.accessToken = process.env.MapboxAccessToken;
    container = document.createElement('div');
    map = new mapboxgl.Map({ container: container });
    geocoder = new MapboxGeocoder(opts);
    map.addControl(geocoder);
  }

  tt.test('input', function(t) {
    setup();
    var inputEl = container.querySelector('.mapboxgl-ctrl-geocoder input');
    var clearEl = container.querySelector('.mapboxgl-ctrl-geocoder button');

    t.plan(6);

    geocoder.on('loading', once(function(e) {
      t.pass('load event was emitted');
      t.equals(e.query, '-79,43', 'loading event passes query parameter');
    }));

    geocoder.on('result', once(function() {
      t.ok(inputEl.value, 'value populates in input');
      clearEl.dispatchEvent(clickEvent);
    }));

    geocoder.on('clear', once(function() {
      t.pass('input was cleared');

      geocoder.setInput('Paris');
      t.equals(inputEl.value, 'Paris', 'value populates in input');

      geocoder.setInput('90,45');
      t.equals(inputEl.value, '90,45', 'valid LngLat value populates in input');
      t.end();
    }));

    geocoder.query('-79,43');
  });

  tt.test('placeholder', function(t) {
    setup({ placeholder: 'foo to the bar' });
    t.equal(map.getContainer().querySelector('.mapboxgl-ctrl-geocoder input').placeholder, 'foo to the bar', 'placeholder is custom');
    t.end();
  });

  tt.end();
});
