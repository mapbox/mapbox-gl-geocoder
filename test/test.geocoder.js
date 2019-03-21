'use strict';

var test = require('tape');
var MapboxGeocoder = require('../');
var mapboxgl = require('mapbox-gl');
var once = require('lodash.once');
var mapboxEvents = require('./../lib/events');
var sinon = require('sinon');
var localization = require('./../lib/localization');
var exceptions = require('./../lib/exceptions');


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
    t.ok(geocoder.fresh, 'geocoder is initialized with fresh status to enable turnstile event');
    t.equals(geocoder.inputString, '', 'geocoder is initialized with an input string for keeping track of state');
    t.ok(geocoder.eventManager instanceof mapboxEvents, 'the geocoder has a mapbox event manager');
    t.true(geocoder.options.trackProximity, 'sets trackProximity to true by default');
    t.end();
  });

  tt.test('set/get input', function(t) {
    t.plan(4)
    setup({ proximity: { longitude: -79.45, latitude: 43.65 } });
    geocoder.query('Queen Street');
    var mapMoveSpy = sinon.spy(map, "flyTo");
    geocoder.on(
      'result',
      once(function(e) {
        t.ok(e.result, 'feature is in the event object');
        var mapMoveArgs = mapMoveSpy.args[0][0];
        t.ok(mapMoveSpy.calledOnce, 'the map#flyTo method was called when a result was selected');
        t.notEquals(mapMoveArgs.center[0], 0, 'center.lng changed')
        t.notEquals(mapMoveArgs.center[1], 0, 'center.lat changed')
      })
    );
  });

  tt.test('options', function(t) {
    t.plan(8);
    setup({
      flyTo: false,
      country: 'fr',
      types: 'region'
    });

    geocoder.query('Paris');
    var startEventMethod = sinon.stub(geocoder.eventManager, "start")

    geocoder.on(
      'results',
      once(function(e) {
        t.ok(e.features.length, 'Event for results emitted');
        t.equals(geocoder.inputString, 'Paris', 'input string keeps track of state');
        t.equals(geocoder.fresh, false, 'once a search has been completed, the geocoder is no longer fresh');
        t.ok(startEventMethod.called, 'a search start event was issued');
        t.ok(startEventMethod.calledOnce, 'a search start event was issued only once');
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
    t.plan(4);
    setup({
      reverseGeocode: true
    });
    geocoder.query('-6.1933875, 34.5177548');
    geocoder.on(
      'results',
      once(function(e) {
        t.equal(e.features.length, 1, 'One result returned');
        t.ok(
          e.features[0].place_name.indexOf('Tanzania') > -1, 
          'returns expected result'
        );
        t.ok(
          e.features[0].place_name.indexOf('Singida') > -1, 
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
    geocoder.query('31.791, -7.0926');
    geocoder.on(
      'results',
      once(function(e) {
        t.deepEquals(e.query, [ -7.0926, 31.791 ], 'parses query');
        t.deepEquals(e.config.types.toString(), 'country', 'uses correct type passed to config' );
        t.equal(e.features[0].place_name, 'Morocco', 'returns expected result');
      })
    );
  });

  tt.test('options.reverseGeocode - false by default', function(t) {
    t.plan(2);
    setup();
    geocoder.query('-6.1933875, 34.5177548');
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
    var mapMoveSpy = sinon.spy(map, "flyTo");
    geocoder.on(
      'result',
      once(function() {
        var mapMoveArgs = mapMoveSpy.args[0][0];
        t.equals(mapMoveArgs.zoom, 12, 'custom zoom is supported');
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
    t.plan(2);
    setup({});
    geocoder.query('Spain');
    var fitBoundsSpy = sinon.spy(map, "fitBounds");
    geocoder.on(
      'result',
      once(function(e) {
        t.ok(fitBoundsSpy.calledOnce, "map#fitBounds was called when a country-level feature was returned")
        var fitBoundsArgs = fitBoundsSpy.args[0][0];
        // flatten
        var mapBBox = [fitBoundsArgs[0][0], fitBoundsArgs[0][1], fitBoundsArgs[1][0], fitBoundsArgs[1][1]];
        t.ok(
          mapBBox.some(function(coord, i) {
            return coord.toPrecision(4) === e.result.bbox[i].toPrecision(4);
          })
        );
      })
    );
  });

  tt.test('country bbox exception', function(t) {
    t.plan(2);
    setup({});
    geocoder.query('Canada');
    var fitBoundsSpy = sinon.spy(map, "fitBounds");
    geocoder.on(
      'result',
      once(function() {
        t.ok(fitBoundsSpy.calledOnce, 'the map#fitBounds method was called when an excepted feature was returned');
        var fitBoundsArgs = fitBoundsSpy.args[0][0];
        // flatten
        var mapBBox = [fitBoundsArgs[0][0], fitBoundsArgs[0][1], fitBoundsArgs[1][0], fitBoundsArgs[1][1]];
        var expectedBBox = exceptions['ca'].bbox;
        var expectedBBoxFlat = [expectedBBox[0][0], expectedBBox[0][1], expectedBBox[1][0], expectedBBox[1][1]]
        t.ok(
          mapBBox.some(function(coord, i) {
            return coord.toPrecision(4) === expectedBBoxFlat[i].toPrecision(4);
          })
        );
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
          .map(function(i) {
            return i.id.startsWith('region') && i.text == 'New South Wales';
          })
          .reduce(function (acc, cur) {
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
            .map(function(feature) {
              return feature.place_name;
            })
            .includes('Heathcote, New South Wales, Australia'),
          'feature included in filter'
        );
        t.notOk(
          e.features
            .map(function(feature) {
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

  tt.test('options.trackProximity=false', function(t) {
    t.plan(2);

    setup({
      trackProximity: false
    });
    t.false(geocoder.options.trackProximity, 'track proximity is set to false');
    t.notOk(geocoder.getProximity(), 'proximity is not available when trackProximity is set to false');
  });

  tt.test('options.setProximity', function(t) {
    t.plan(1);

    setup({});

    map.setZoom(13);
    map.setCenter([-79.4512, 43.6568]);
    geocoder.setProximity({ longitude: -79.4512, latitude: 43.6568});

    geocoder.query('high');
    geocoder.on(
      'results',
      once(function(e) {
        t.ok(
          e.features[0].place_name.indexOf('Toronto') !== -1,
          'proximity applied in geocoding request'
        );
      })
    );
  });

  tt.test('options.flyTo [false]', function(t){
    t.plan(1)
    setup({
      flyTo: false
    });

    var mapFlyMethod =  sinon.spy(map, "flyTo");
    geocoder.query('Golden Gate Bridge');
    geocoder.on(
      'result',
      once(function() {
        t.ok(mapFlyMethod.notCalled, "The map flyTo was not called when the option was set to false")
      })
    );
  });


  tt.test('options.flyTo [true]', function(t){
    t.plan(3)
    setup({
      flyTo: true
    });

    var mapFlyMethod =  sinon.spy(map, "flyTo");
    geocoder.query('Golden Gate Bridge');
    geocoder.on(
      'result',
      once(function() {
        t.ok(mapFlyMethod.calledOnce, "The map flyTo was called when the option was set to true");
        var calledWithArgs = mapFlyMethod.args[0][0];
        t.deepEqual(calledWithArgs.center, [ -122.47846, 37.819378 ], 'the map is directed to fly to the right place');
        t.deepEqual(calledWithArgs.zoom, 16, 'the map is directed to fly to the right zoom');
      })
    );
  });

  tt.test('options.flyTo [object]', function(t){
    t.plan(4)
    setup({
      flyTo: {
        speed: 5,
        zoom: 4,
        center: [0, 0]
      }
    });

    var mapFlyMethod =  sinon.spy(map, "flyTo");
    geocoder.query('Golden Gate Bridge');
    geocoder.on(
      'result',
      once(function() {
        t.ok(mapFlyMethod.calledOnce, "The map flyTo was called when the option was set to true");
        var calledWithArgs = mapFlyMethod.args[0][0];
        t.deepEqual(calledWithArgs.center, [ -122.47846, 37.819378 ], 'the selected result overrides the constructor center option');
        t.deepEqual(calledWithArgs.zoom, 16, 'the selected result overrides the constructor zoom optiopn');
        t.deepEqual(calledWithArgs.speed, 5, 'speed argument is passed to the flyTo method');
      })
    );
  })

  tt.test('placeholder localization', function(t){
    var ensureLanguages = ['de', 'en', 'fr', 'it', 'nl', 'ca', 'cs', 'fr', 'he', 'hu', 'is', 'ja', 'ka', 'ko', 'lv', 'ka', 'ko', 'lv', 'nb', 'pl', 'pt', 'sk', 'sl', 'sr', 'th', 'zh'];
    ensureLanguages.forEach(function(languageTag){
      t.equals(typeof(localization.placeholder[languageTag]), 'string', 'localized placeholder value is present for language=' + languageTag);
    });
    t.end();
  });

  tt.test('options.marker [true]', function(t) {
    t.plan(2);

    setup({
      marker: true,
      mapboxgl: mapboxgl
    });
    var markerConstructorSpy = sinon.spy(mapboxgl, "Marker");

    geocoder.query('high');
    geocoder.on(
      'result',
      once(function() {  
        t.ok(markerConstructorSpy.calledOnce, "a new marker is added to the map");
        var calledWithOptions = markerConstructorSpy.args[0][0];
        t.equals(calledWithOptions.color, '#4668F2', 'a default color is set');
        markerConstructorSpy.restore();
      })
    );
  });

  tt.test('options.marker  [constructor properties]', function(t) {
    t.plan(4);

    setup({
      marker: {
        color: "purple",
        draggable: true,
        anchor: 'top'
      },
      mapboxgl: mapboxgl
    });
    var markerConstructorSpy = sinon.spy(mapboxgl, "Marker");

    geocoder.query('high');
    geocoder.on(
      'result',
      once(function() {  
        t.ok(markerConstructorSpy.calledOnce, "a new marker is added to the map");
        var calledWithOptions = markerConstructorSpy.args[0][0];
        t.equals(calledWithOptions.color, 'purple', "sets the correct color property");
        t.equals(calledWithOptions.draggable, true, "sets the correct draggable property");
        t.equals(calledWithOptions.anchor, 'top', "default anchor is overriden by custom properties");
        markerConstructorSpy.restore();
      })
    );
  });

  tt.test('options.marker [false]', function(t) {
    t.plan(1);

    setup({
      marker: false
    });
    var markerConstructorSpy = sinon.spy(mapboxgl, "Marker");

    geocoder.query('high');
    geocoder.on(
      'result',
      once(function() {  
        t.ok(markerConstructorSpy.notCalled, "a new marker is not added to the map");
        markerConstructorSpy.restore();
      })
    );
  });

  tt.test('geocode#onRemove', function(t){
    setup({marker: true});

    var removeMarkerMethod = sinon.spy(geocoder, "_removeMarker");

    geocoder.onRemove();

    t.ok(removeMarkerMethod.calledOnce, 'markers are removed when the plugin is removed');
    t.equals(geocoder._map, null, "the map context is removed from the geocoder when the plugin is removed");

    t.end();
  })

  tt.end();
});
