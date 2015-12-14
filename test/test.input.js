'use strict';

const once = require('lodash.once');
const test = require('tape');

test('Geocoder#inputControl', tt => {
  let container, map, geocoder;

  const changeEvent = document.createEvent('HTMLEvents');
  changeEvent.initEvent('change', true, false);

  const clickEvent = document.createEvent('HTMLEvents');
  clickEvent.initEvent('click', true, false);

  function setup(opts) {
    container = document.createElement('div');
    map = new mapboxgl.Map({ container: container });
    geocoder = new mapboxgl.Geocoder(opts);
    map.addControl(geocoder);
  }

  tt.test('input', t => {
    setup();
    t.plan(4);
    var inputEl = container.querySelector('.mapboxgl-ctrl-geocoder input');
    var clearEl = container.querySelector('.mapboxgl-ctrl-geocoder button');
    inputEl.addEventListener('change', once(() => {
      t.ok(inputEl.value, 'value populates in input');
      t.ok(clearEl.classList.contains('active'), 'clear link is active');
      clearEl.dispatchEvent(clickEvent);
    }));

    geocoder.on('geocoder.loading', once(() => {
      t.ok('load event was emitted');
    }));

    geocoder.on('geocoder.clear', once(() => {
      t.ok('input was cleared');
    }));

    geocoder.set([-79, 43]);
  });

  tt.end();
});

