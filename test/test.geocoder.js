'use strict';

const test = require('tape');
const once = require('lodash.once');

test('geocoder', (tt) => {
  let container, map, geocoder;

  function setup(opts) {
    container = document.createElement('div');
    map = new mapboxgl.Map({ container: container });
    geocoder = new mapboxgl.Geocoder(opts);
    map.addControl(geocoder);
  }

  tt.test('initialized', t => {
    setup();
    t.ok(geocoder, 'geocoder is initialized');
    t.end();
  });

  tt.test('set/get input', t => {
    t.plan(2);
    setup({ proximity: [-79.45, 43.65] });
    geocoder.query('Queen Street');
    geocoder.on('geocoder.input', once((e) => {
      t.ok(geocoder.getResult(), 'feature is present from get');
      t.ok(e.result, 'feature is in the event object');
    }));
  });

  tt.test('fire', t => {
    t.plan(1);
    setup();

    geocoder.on('custom', (e) => {
      t.equals(e.custom, 'data');
    });

    geocoder.fire('custom', { custom: 'data'});
  });

  tt.end();
});
