'use strict';

var test = require('tape');
var MapboxGeocoder = require('../');
var mapboxgl = require('mapbox-gl');
var once = require('lodash.once');

mapboxgl.accessToken = process.env.MapboxAccessToken;

test('geocoder', function(tt) {
  var container, map, geocoder;

  function setup(opts) {
    opts = opts || {};
    opts.accessToken = mapboxgl.accessToken;
    container = document.createElement('div');
    map = new mapboxgl.Map({ container: container });
    geocoder = new MapboxGeocoder(opts);
    map.addControl(geocoder);
  }

  tt.test('initialized', function(t) {
    setup();
    t.ok(geocoder, 'geocoder is initialized');
    t.end();
  });

  tt.test('set/get input', function(t) {
    setup({ proximity: { longitude: -79.45, latitude: 43.65 } });
    geocoder.query('Queen Street');
    geocoder.on(
      'result',
      once(function(e) {
        t.ok(e.result, 'feature is in the event object');
        map.once('moveend', function() {
          var center = map.getCenter();
          t.notEquals(center.lng, 0, 'center.lng changed');
          t.notEquals(center.lat, 0, 'center.lat changed');
          t.end();
        });
      })
    );
  });

  tt.test('options', function(t) {
    t.plan(4);
    setup({
      flyTo: false,
      country: 'fr',
      types: 'region'
    });

    geocoder.query('Paris');

    geocoder.on(
      'results',
      once(function(e) {
        t.ok(e.features.length, 'Event for results emitted');
      })
    );

    geocoder.on(
      'result',
      once(function(e) {
        var center = map.getCenter();
        t.equals(center.lng, 0, 'center.lng is unchanged');
        t.equals(center.lat, 0, 'center.lat is unchanged');
        t.equals(
          e.result.place_name,
          'Paris, France',
          'one result is returned with expected place name'
        );
      })
    );
  });

  tt.test('custom endpoint', function(t) {
    t.plan(1);
    setup({ origin: 'localhost:2999' });
    t.equals(
      geocoder.options.origin,
      'localhost:2999',
      'options picks up custom endpoint'
    );
  });

  tt.test('options.bbox', function(t) {
    t.plan(2);
    setup({
      bbox: [
        -122.71901248631752,
        37.62347223479118,
        -122.18070124967602,
        37.87996631184369
      ]
    });

    geocoder.query('London');
    geocoder.on(
      'results',
      once(function(e) {
        t.ok(e.features.length, 'Event for results emitted');
        t.equals(
          e.features[0].text,
          'London Market',
          'Result is returned within a bbox'
        );
      })
    );
  });

  tt.test('options.reverseGeocode - true', function(t) {
    t.plan(3);
    setup({
      reverseGeocode: true
    });
    geocoder.query('34.5177548, -6.1933875');
    geocoder.on(
      'results',
      once(function(e) {
        t.equal(e.features.length, 1, 'One result returned');
        t.equal(
          e.features[0].place_name,
          'Singida, Tanzania',
          'returns expected result'
        );
        t.equal(e.config.limit, 1, 'sets limit to 1 for reverse geocodes');
      })
    );
  });

  tt.test('options.reverseGeocode - interprets coordinates & options correctly', function(t) {
    t.plan(3);
    setup({
      types: 'country',
      reverseGeocode: true
    });
    geocoder.query('-7.0926 31.791');
    geocoder.on(
      'results',
      once(function(e) {
        console.log(e);
        t.deepEquals(e.query, [ -7.0926, 31.791 ], 'parses query');
        t.deepEquals(e.config.types.toString(), 'country', 'uses correct type passed to config' );
        t.equal(e.features[0].place_name, 'Morocco', 'returns expected result');
      })
    );
  });

  tt.test('options.reverseGeocode - false by default', function(t) {
    t.plan(2);
    setup();
    geocoder.query('34.5177548, -6.1933875');
    geocoder.on(
      'results',
      once(function(e) {
        t.equal(e.features.length, 0, 'No results returned');
      })
    );
    geocoder.on(
      'error',
      once(function(e) {
        t.equal(e.error.statusCode, 422, 'should error');
      })
    );
  });

  tt.test('parses options correctly', function(t) {
    t.plan(4);
    setup({
      language: 'en,es,zh',
      types: 'district, locality, neighborhood, postcode',
      countries: 'us, mx'
    });

    var languages = ['en', 'es', 'zh'];
    var types = ['district', 'locality', 'neighborhood', 'postcode'];
    var countries = ['us', 'mx'];

    geocoder.query('Hartford');
    geocoder.on(
      'results',
      once(function(e) {
        t.equal(e.features.length, 5, 'Five results returned');
        t.deepEquals(
          e.config.language,
          languages,
          'converts language options with no spaces to array'
        );
        t.deepEquals(e.config.types, types, 'converts types options to array');
        t.deepEquals(
          e.config.countries,
          countries,
          'converts countries options to array'
        );
      })
    );
  });

  tt.test('options.limit', function(t) {
    t.plan(1);
    setup({
      flyTo: false,
      limit: 6
    });

    geocoder.query('London');
    geocoder.on(
      'results',
      once(function(e) {
        t.equal(e.features.length, 6, 'Results limit applied');
      })
    );
  });

  tt.test('options:zoom', function(t) {
    t.plan(1);
    setup({ zoom: 12 });
    geocoder.query('1714 14th St NW');
    geocoder.on(
      'result',
      once(function() {
        map.once('zoomend', function() {
          t.equals(parseInt(map.getZoom()), 12, 'Custom zoom is supported');
        });
      })
    );
  });

  tt.test('options.localGeocoder', function(t) {
    t.plan(3);
    setup({
      flyTo: false,
      limit: 6,
      localGeocoder: function(q) {
        return [q];
      }
    });

    geocoder.query('-30,150');
    geocoder.on(
      'results',
      once(function(e) {
        t.equal(e.features.length, 1, 'Local geocoder used');

        geocoder.query('London');
        geocoder.on(
          'results',
          once(function(e) {
            t.equal(
              e.features.length,
              7,
              'Local geocoder supplement remote response'
            );

            geocoder.query('London');
            geocoder.on(
              'results',
              once(function(e) {
                t.equal(
                  e.features[0],
                  'London',
                  'Local geocoder results above remote response'
                );
              })
            );
          })
        );
      })
    );
  });

  tt.test('country bbox', function(t) {
    t.plan(1);
    setup({});
    geocoder.query('Spain');
    geocoder.on(
      'result',
      once(function(e) {
        map.once('moveend', function() {
          var mapBBox = Array.prototype.concat.apply(
            [],
            map.getBounds().toArray()
          );

          t.ok(
            mapBBox.some(function(coord, i) {
              return coord.toPrecision(4) === e.result.bbox[i].toPrecision(4);
            })
          );
        });
      })
    );
  });

  tt.test('country bbox exception', function(t) {
    t.plan(1);
    setup({});
    geocoder.query('Canada');
    geocoder.on(
      'result',
      once(function(e) {
        map.once('moveend', function() {
          var mapBBox = Array.prototype.concat.apply(
            [],
            map.getBounds().toArray()
          );

          t.ok(
            mapBBox.every(function(coord, i) {
              return coord.toPrecision(4) != e.result.bbox[i].toPrecision(4);
            })
          );
        });
      })
    );
  });

  tt.test('lint exceptions file', function(t) {
    var exceptions = require('../lib/exceptions.js');
    t.plan(Object.keys(exceptions).length * 5);

    for (var id in exceptions) {
      var ex = exceptions[id];

      t.ok(ex.name, 'exception includes place name');
      t.ok(ex.bbox, 'exception includes bbox');
      t.ok(Array.isArray(ex.bbox), 'exception bbox is array');
      t.equals(ex.bbox.length, 2, 'exception bbox has two corners');
      t.ok(
        ex.bbox.every(function(corner) {
          return Array.isArray(corner) && corner.length === 2;
        }),
        'exception bbox corners each have two components'
      );
    }
  });

  tt.test('options.filter', function(t) {
    t.plan(2);
    /* testing filter by searching for a place Heathcote in New South Wales, Australia,
     * which also exists in a part of Victoria which is still inside the New South Wales bbox. */
    setup({
      country: 'au',
      types: 'locality',
      bbox: [140.99926, -37.595494, 159.51677, -28.071477], // bbox for New South Wales, but Heathcote, Victoria is still within this bbox
      filter: function(item) {
        // returns true if item contains 'New South Wales' as the region
        return item.context
          .map(i => {
            return i.id.startsWith('region') && i.text == 'New South Wales';
          })
          .reduce((acc, cur) => {
            return acc || cur;
          });
      }
    });

    geocoder.query('Heathcote');
    geocoder.on(
      'results',
      once(function(e) {
        t.ok(
          e.features
            .map(feature => {
              return feature.place_name;
            })
            .includes('Heathcote, New South Wales, Australia'),
          'feature included in filter'
        );
        t.notOk(
          e.features
            .map(feature => {
              return feature.place_name;
            })
            .includes('Heathcote, Victoria, Australia'),
          'feature excluded in filter'
        );
      })
    );
  });

  tt.test('options.trackProximity', function(t) {
    t.plan(2);

    setup({
      trackProximity: true
    });

    map.setZoom(10);
    map.setCenter([15, 10]);
    t.deepEquals(
      geocoder.getProximity(),
      { longitude: 15, latitude: 10 },
      'proximity updates after setCenter'
    );

    map.setZoom(9);
    t.notOk(geocoder.getProximity(), 'proximity unset after zooming out');
  });

  tt.end();
});
