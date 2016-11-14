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
    geocoder = MapboxGeocoder(opts);
    map.addControl(geocoder);
  }

  tt.test('input', function(t) {
    setup();
    t.plan(10);
    var inputEl = container.querySelector('.mapboxgl-ctrl-geocoder input');
    var clearEl = container.querySelector('.mapboxgl-ctrl-geocoder button');
    inputEl.addEventListener('change', once(function() {
      t.ok(inputEl.value, 'value populates in input');
      t.ok(clearEl.classList.contains('active'), 'clear link is active');
      clearEl.dispatchEvent(clickEvent);
    }));

    geocoder.on('loading', once(function() {
      t.ok('load event was emitted');
    }));

    geocoder.on('clear', once(function() {
      t.ok('input was cleared');
      t.notOk(clearEl.classList.contains('active'), 'clear link removed');

      geocoder.setInput('Paris');
      t.equals(inputEl.value, 'Paris', 'value populates in input');
      t.ok(clearEl.classList.contains('active'), 'clear link is active');

      geocoder.setInput([90, 45]);
      t.equals(inputEl.value, '90,45', 'valid LngLat value populates in input');

      geocoder.setInput([270, 45]);
      t.equals(inputEl.value, '-90,45', 'LngLat wraps if need be');
    }));

    geocoder.query([-79, 43]);
  });

  tt.test('position', function(t) {
    setup({ position: 'bottom-left' });
    t.ok(map.getContainer().querySelector('.mapboxgl-ctrl-bottom-left .mapboxgl-ctrl-geocoder'));
    t.end();
  });

  tt.test('placeholder', function(t) {
    setup({ placeholder: 'foo to the bar' });
    t.equal(map.getContainer().querySelector('.mapboxgl-ctrl-geocoder input').placeholder, 'foo to the bar', 'placeholder is custom');
    t.end();
  });

  tt.test('container', function(t) {
    container = document.createElement('div');
    map = new mapboxgl.Map({ container: container });

    var customEl = document.createElement('div');
    customEl.id = 'custom';
    map.getContainer().appendChild(customEl);

    geocoder = MapboxGeocoder({
      container: customEl
    });

    map.addControl(geocoder);
    t.ok(map.getContainer().querySelector('#custom .mapboxgl-ctrl-geocoder'), 'appended to custom container');
    t.end();
  });

  tt.end();
});
