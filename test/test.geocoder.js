'use strict';

var test = require('tape');
var once = require('lodash.once');

test('geocoder', function(tt) {
  var container, map, geocoder;

  function setup(opts) {
    container = document.createElement('div');
    map = new mapboxgl.Map({ container: container });
    geocoder = new mapboxgl.Geocoder(opts);
    map.addControl(geocoder);
  }

  tt.test('initialized', function(t) {
    setup();
    t.ok(geocoder, 'geocoder is initialized');
    t.end();
  });

  tt.test('set/get input', function(t) {
    t.plan(4);
    setup({ proximity: [-79.45, 43.65] });
    geocoder.query('Queen Street');
    geocoder.on('result', once(function(e) {
      t.ok(geocoder.getResult(), 'feature is present from get');
      t.ok(e.result, 'feature is in the event object');
      map.once(map.on('moveend', function() {
        var center = map.getCenter();
        t.notEquals(center.lng, 0, 'center.lng changed');
        t.notEquals(center.lat, 0, 'center.lat changed');
      }));
    }));
  });

  tt.test('options', function(t) {
    t.plan(4);
    setup({
      flyTo: false,
      country: 'fr',
      types: 'region'
    });

    geocoder.query('Paris');

    geocoder.on('results', once(function(e) {
      t.ok(e.results.length, 'Event for results emitted');
    }));

    geocoder.on('result', once(function(e) {
      var center = map.getCenter();
      t.equals(center.lng, 0, 'center.lng is unchanged');
      t.equals(center.lat, 0, 'center.lat is unchanged');
      t.equals(e.result.place_name, 'Paris, France', 'one result is returned with expected place name');
    }));
  });

  tt.test('options.bbox', function(t) {
    t.plan(2);
    setup({
      bbox: [
        -122.71901248631752,37.62347223479118,
        -122.18070124967602, 37.87996631184369
      ]
    });

    geocoder.query('Paris');
    geocoder.on('results', once(function(e) {
      t.ok(e.results.length, 'Event for results emitted');
      t.equals(e.results[0].text, 'Paris Jewelry', 'Result is returned within a bbox');
    }));
  });

  tt.test('options:zoom', function(t) {
    t.plan(1);
    setup({ zoom: 12 });
    geocoder.query('1714 14th St NW');
    geocoder.on('result', once(function() {
      map.once(map.on('moveend', function() {
        t.equals(map.getZoom(), 12, 'Custom zoom is supported');
      }));
    }));
  });

  tt.test('fire', function(t) {
    t.plan(2);
    setup();

    function custom(e) {
      t.equals(e.custom, 'data');
      geocoder.off('custom', custom);
    }

    geocoder.on('custom', custom);
    geocoder.fire('custom', { custom: 'data'});
    geocoder.fire('custom', { custom: 'data'});
    t.ok(true, 'event fires only once');
  });

  tt.end();
});
