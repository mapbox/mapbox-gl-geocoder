'use strict';

var once = require('lodash.once');
var MapboxGeocoder = require('../lib/index');
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
    opts.accessToken = mapboxgl.accessToken;
    container = document.createElement('div');
    map = new mapboxgl.Map({ container: container });
    geocoder = new MapboxGeocoder(opts);
    map.addControl(geocoder);
  }

  tt.test('input', function(t) {
    setup({
      types: 'place'
    });
    var inputEl = container.querySelector('.mapboxgl-ctrl-geocoder input');
    var clearEl = container.querySelector('.mapboxgl-ctrl-geocoder button');

    t.plan(7);

    geocoder.on(
      'loading',
      once(function(e) {
        t.pass('load event was emitted');
        t.equals(e.query, '-79,43', 'loading event passes query parameter');
      })
    );

    geocoder.on(
      'result',
      once(function() {
        t.ok(inputEl.value, 'value populates in input');
        clearEl.dispatchEvent(clickEvent);
      })
    );

    geocoder.on(
      'clear',
      once(function() {
        t.pass('input was cleared');
        t.equals(geocoder.fresh, false, 'the geocoder is fresh again')

        geocoder.setInput('Paris');
        t.equals(inputEl.value, 'Paris', 'value populates in input');

        geocoder.setInput('90,45');
        t.equals(
          inputEl.value,
          '90,45',
          'valid LngLat value populates in input'
        );
        t.end();
      })
    );

    geocoder.query('-79,43');
  });

  tt.test('placeholder', function(t) {
    t.plan(1);
    setup({ placeholder: 'foo to the bar' });
    t.equal(
      map.getContainer().querySelector('.mapboxgl-ctrl-geocoder input')
        .placeholder,
      'foo to the bar',
      'placeholder is custom'
    );
    t.end();
  });

  tt.test('createIcon', function(t) {
    t.plan(1);
    setup({ });
    var icon = geocoder.createIcon('search', '<path/>');
    t.equal(
      icon.outerHTML,
      '<svg class="geocoder-icon geocoder-icon-search" viewBox="0 0 18 18" xml:space="preserve" width="18" height="18"><path></path></svg>',
      'creates an svg given the class name and path'
    );
    t.end();
  });

  tt.end();
});
