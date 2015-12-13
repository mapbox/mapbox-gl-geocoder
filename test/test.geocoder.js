'use strict';

const test = require('tape');
const once = require('lodash.once');

test('geocoder', (tt) => {
  let container, geocoder;

  function setup(opts) {
    container = document.createElement('div');
    geocoder = new mapboxgl.Geocoder(opts, Object.assign({
      container: container
    }, opts));
  }

  tt.test('initialized', t => {
    setup();
    t.ok(geocoder, 'geocoder is initialized');
    t.end();
  });

  tt.test('set/get input', t => {
    t.plan(2);
    setup({ proximity: [-79.45, 43.65] });

    geocoder.setInput('Queen Street');

    geocoder.on('geocoder.input', once((e) => {
      t.ok(geocoder.getInput().type, 'feature is present from get');
      t.ok(e.feature, 'feature is in the event object');
    }));
  });

  tt.end();
});

