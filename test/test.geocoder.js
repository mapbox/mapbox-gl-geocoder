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
    t.plan(2);
    setup({ proximity: [-79.45, 43.65] });
    geocoder.query('Queen Street');
    geocoder.on('geocoder.input', once(function(e) {
      t.ok(geocoder.getResult(), 'feature is present from get');
      t.ok(e.result, 'feature is in the event object');
    }));
  });

  tt.test('options', function(t) {
    t.plan(1);
    setup({
      country: 'fr',
      types: 'region'
    });
    geocoder.query('Paris');
    geocoder.on('geocoder.input', once(function(e) {
      t.equals(e.result.place_name, 'Paris, France', 'one result is returned with expected place name');
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
