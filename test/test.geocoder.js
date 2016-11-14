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

    geocoder.query('London');
    geocoder.on('results', once(function(e) {
      t.ok(e.results.length, 'Event for results emitted');
      t.equals(e.results[0].text, 'London Sole', 'Result is returned within a bbox');
    }));
  });

  tt.test('options:zoom', function(t) {
    t.plan(1);
    setup({ zoom: 12 });
    geocoder.query('1714 14th St NW');
    geocoder.on('result', once(function() {
      map.once(map.on('moveend', function() {
        t.equals(parseInt(map.getZoom()), 12, 'Custom zoom is supported');
      }));
    }));
  });

  tt.test('country bbox', function(t) {
    t.plan(1);
    setup({});
    geocoder.query('Spain');
    geocoder.on('result', once(function(e) {
      map.once(map.on('moveend', function() {
        var mapBBox = Array.prototype.concat.apply([], map.getBounds().toArray());

        t.ok(mapBBox.some(function(coord, i) {
          return coord.toPrecision(4) === e.result.bbox[i].toPrecision(4);
        }));
      }));
    }));
  });

  tt.test('country bbox exception', function(t) {
    t.plan(1);
    setup({});
    geocoder.query('United States');
    geocoder.on('result', once(function(e) {
      map.once(map.on('moveend', function() {
        var mapBBox = Array.prototype.concat.apply([], map.getBounds().toArray());

        t.ok(mapBBox.every(function(coord, i) {
          return coord.toPrecision(4) != e.result.bbox[i].toPrecision(4);
        }));
      }));
    }));
  });

  tt.test('lint exceptions file', function(t) {
    var exceptions = require('./exceptions.js');
    t.plan(Object.keys(exceptions).length * 5);

    for (var id in exceptions) {
      var ex = exceptions[id];

      t.ok(ex.name, 'exception includes place name');
      t.ok(ex.bbox, 'exception includes bbox');
      t.ok(Array.isArray(ex.bbox), 'exception bbox is array');
      t.equals(ex.bbox.length, 2, 'exception bbox has two corners');
      t.ok(ex.bbox.every(function(corner) { return Array.isArray(corner) && corner.length === 2; }), 'exception bbox corners each have two components');
    }
  });

  tt.end();
});
