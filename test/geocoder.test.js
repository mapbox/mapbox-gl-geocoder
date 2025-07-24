import {describe, test, expect} from 'vitest';
import once from 'lodash.once';
import sinon from 'sinon';

import mapboxgl from 'mapbox-gl';

import MapboxGeocoder from '../lib/index.js';
import mapboxEvents from '../lib/events.js';
import * as localization from '../lib/localization.js';
import exceptions from '../lib/exceptions.js';

mapboxgl.accessToken = import.meta.env.MapboxAccessToken;

describe('geocoder', function () {
  let container, map, geocoder;

  function setup(opts) {
    opts = opts || {};
    opts.accessToken = opts.accessToken || mapboxgl.accessToken;
    opts.mapboxgl = opts.mapboxgl || mapboxgl; // set default to prevent warnings littering the test logs
    opts.enableEventLogging = false;
    container = document.createElement('div');
    map = new mapboxgl.Map({
      container: container,
      projection: 'mercator',
      style: 'mapbox://styles/mapbox/standard',
    });
    geocoder = new MapboxGeocoder(opts);
    map.addControl(geocoder);
  }

  test('initialized', function() {
    setup();
    // geocoder is initialized
    expect(geocoder).toBeTruthy();
    // geocoder is initialized with fresh status to enable turnstile event
    expect(geocoder.fresh).toBeTruthy();
    // geocoder is initialized with an input string for keeping track of state
    expect(geocoder.inputString).toEqual('');
    // the geocoder has a mapbox event manager
    expect(geocoder.eventManager instanceof mapboxEvents).toBeTruthy();
    // sets trackProximity to true by default
    expect(geocoder.options.trackProximity).toBeTruthy();
  });

  test('set/get input', async function() {
    setup({ proximity: { longitude: -79.45, latitude: 43.65 } });

    await new Promise((resolve) => {
      map.once('style.load', () => {
        var mapMoveSpy = sinon.spy(map, "flyTo");
        geocoder.once(
          'result',
          function(e) {
            // feature is in the event object
            expect(e.result).toBeTruthy();
            var mapMoveArgs = mapMoveSpy.args[0][0];
            // the map#flyTo method was called when a result was selected
            expect(mapMoveSpy.calledOnce).toBeTruthy();
            // center.lng changed
            expect(mapMoveArgs.center[0]).not.toEqual(-92.25)
            // center.lat changed
            expect(mapMoveArgs.center[1]).not.toEqual(37.75)

            resolve();
          }
        );
        geocoder.query('Queen Street');
      });
    });
  });

  test('options', async function({expect}) {
    expect.assertions(8);

    setup({
      flyTo: false,
      country: 'fr',
      types: 'region'
    });

    await new Promise((resolve) => {
      map.once('style.load', () => {
        var startEventMethod = sinon.stub(geocoder.eventManager, "start")

        geocoder.once(
          'results',
          function(e) {
            // Event for results emitted
            expect(e.features.length).toBeTruthy();
            // input string keeps track of state
            expect(geocoder.inputString).toEqual('Paris');
            // once a search has been completed, the geocoder is no longer fresh
            expect(geocoder.fresh).toEqual(false);
            // a search start event was issued
            expect(startEventMethod.called).toBeTruthy();
            // a search start event was issued only once
            expect(startEventMethod.calledOnce).toBeTruthy();
          }
        );

        geocoder.once(
          'result',
          function(e) {
            var center = map.getCenter();
            // center.lng is unchanged
            expect(center.lng).toEqual(0);
            // center.lat is unchanged
            expect(center.lat).toEqual(0);
            // one result is returned with expected place name
            expect(e.result.place_name).toEqual('Paris, France');
            resolve();
          }
        );

        geocoder.query('Paris');
      });
    });
  });

  test('custom endpoint', function() {
    setup({ origin: 'localhost:2999' });
    // options picks up custom endpoint
    expect(geocoder.options.origin).toEqual('localhost:2999');
  });

  test("swapped endpoint", function() {
    setup({ origin: 'localhost:2999' });
    geocoder.setOrigin("https://api.mapbox.com");
    const wait = new Promise(resolve => {
      geocoder.on("results", function(e) {
        // endpoint correctly reset
        expect(e.request.origin).toEqual("https://api.mapbox.com");
        resolve();
      });
    });
    geocoder.query("pizza");
    return wait;
  });

  test('options.bbox', function() {
    setup({
      bbox: [
        -122.71901248631752,
        37.62347223479118,
        -122.18070124967602,
        37.87996631184369
      ]
    });

    const wait = new Promise(resolve => {
      geocoder.once(
        'results',
        function(e) {
          // Event for results emitted
          expect(e.features.length).toBeTruthy();
          // Result is returned within a bbox
          expect(e.features[0].text).toEqual('London Road');
          resolve();
        }
      );
    });
    geocoder.query('London');
    return wait;
  });

  test('options.reverseGeocode - true', function() {
    setup({
      reverseGeocode: true
    });
    const wait = new Promise(resolve => {
      geocoder.once(
        'results',
        function(e) {
          // One result returned
          expect(e.features.length).toEqual(1);
          // returns expected result
          expect(e.features[0].place_name.indexOf('Tanzania') > -1).toBeTruthy();
          // returns expected result
          expect(e.features[0].place_name.indexOf('Singida') > -1).toBeTruthy();
          // sets limit to 1 for reverse geocodes
          expect(e.config.limit).toEqual(1);
          resolve();
        }
      );
    });
    geocoder.query('-6.1933875, 34.5177548');
    return wait;
  });

  test('options.reverseGeocode - interprets coordinates & options correctly', function() {
    setup({
      types: 'country',
      reverseGeocode: true
    });
    const wait = new Promise(resolve => {
      geocoder.once(
        'results',
        function(e) {
          // parses query
          expect(e.query).toStrictEqual([ -7.0926, 31.791 ]);
          // uses correct type passed to config
          expect(e.config.types.toString()).toEqual('country');
          // returns expected result
          expect(e.features[0].place_name).toEqual('Morocco');
          resolve();
        }
      );
    });
    geocoder.query('31.791, -7.0926');
    return wait;
  });

  test('options.reverseGeocode - false by default', function() {
    setup();
    const wait = new Promise(resolve => {
      geocoder.once(
        'results',
        function(e) {
          // No results returned
          expect(e.features.length).toEqual(0);
          resolve();
        }
      );
    });
    geocoder.query('-6.1933875, 34.5177548');
    return wait;
  });

  test('options.reverseGeocode: true with trackProximity: true', function() {
    setup({
      reverseGeocode: true,
      trackProximity: true
    });
    map.jumpTo({
      zoom: 16,
      center: [10, 10]
    });
    geocoder.query('-6.1933875, 34.5177548');
  });

  test('options.flipCoordinates - false by default', function() {
    setup({
      reverseGeocode: true,
    });
    const wait = new Promise(resolve => {
      geocoder.once('results', function(e) {
        // No results returned
        expect(e.features.length).toEqual(0);
        resolve();
      });
    });
    geocoder.query('-98, 40');
    return wait;
  })

  test('options.flipCoordinates - true accepts lon,lat order', function() {
    setup({
      reverseGeocode: true,
      flipCoordinates: true
    });
    const wait = new Promise(resolve => {
      geocoder.once('results', function(e) {
        // One result returned
        expect(e.features.length).toEqual(1);
        resolve();
      });
    });
    geocoder.query('-98, 40');
    return wait;
  })

  test('options.flipCoordinates - true does not accept lat,lon order', function() {
    setup({
      reverseGeocode: true,
      flipCoordinates: true
    });
    const wait = new Promise(resolve => {
      geocoder.once('results', function(e) {
        // No results returned
        expect(e.features.length).toEqual(0)
        resolve();
      });
    });
    geocoder.query('40, -98');
    return wait;
  })

  test('parses options correctly', function() {
    setup({
      language: 'en,es,zh',
      types: 'district, locality, neighborhood, postcode',
      countries: 'us, mx'
    });

    var languages = ['en', 'es', 'zh'];
    var types = ['district', 'locality', 'neighborhood', 'postcode'];
    var countries = ['us', 'mx'];

    const wait = new Promise(resolve => {
      geocoder.once(
        'results',
        function(e) {
          // Five results returned
          expect(e.features.length).toEqual(5);
          // converts language options with no spaces to array
          expect(
            e.config.language,
          ).toStrictEqual(languages);
          // converts language options with spaces to array
          expect(e.config.types).toStrictEqual(types);
          // converts countries options to array
          expect(
            e.config.countries,
          ).toStrictEqual(countries);
          resolve();
        }
      );
    });
    geocoder.query('Hartford');
    return wait;
  });

  test('options.limit', function() {
    setup({
      flyTo: false,
      limit: 6
    });

    const wait = new Promise(resolve => {
      geocoder.once(
        'results',
        function(e) {
          // Results limit applied
          expect(e.features.length).toEqual(6);
          resolve();
        }
      );
    });
    geocoder.query('London');
    return wait;
  });

  test('options:zoom', function() {
    setup({ zoom: 12 });
    var mapMoveSpy = sinon.spy(map, "flyTo");
    const wait = new Promise(resolve => {
      geocoder.once(
        'result',
        function() {
          var mapMoveArgs = mapMoveSpy.args[0][0];
          // custom zoom is supported
          expect(mapMoveArgs.zoom).toEqual(12);
          resolve();
        }
      );
    });
    geocoder.query('1714 14th St NW');
    return wait;
  });

  test('options.localGeocoder', function() {
    setup({
      flyTo: false,
      limit: 6,
      localGeocoder: function(q) {
        return [{
          place_name: q,
          geometry: {
            type: "Point",
            coordinates: [0, 0]
          },
          properties: {},
          id: 'abc.123'
        }]
      }
    });

    const wait = new Promise(resolve => {
      geocoder.once(
        'results',
        function(e) {
          // Local geocoder supplement remote response
          expect(e.features.length).toEqual(7);
          // Local geocoder results above remote response
          expect(e.features[0].place_name).toEqual('London');
          resolve();
        }
      );
    });
    geocoder.query('London');
    return wait;
  });

  test('options.localGeocoder with reverseGeocode=true', function() {
    setup({
      flyTo: false,
      reverseGeocode: true,
      localGeocoder: function(q) {
        return [{
          place_name: q,
          geometry: {
            type: "Point",
            coordinates: [0, 0]
          },
          properties: {},
          id: 'abc.123'
        }]
      }
    });

    const wait = new Promise(resolve => {
      geocoder.on(
        'results',
        function(e) {
          // Local geocoder used
          expect(e.features.length).toEqual(2);
          // Local geocoder supplement remote response
          expect(e.features[0].place_name).toEqual('-30,150');
          resolve();
        }
      );
    });
    geocoder.query('-30,150');
    return wait;
  });

  test('options.externalGeocoder', function() {
    setup({
      flyTo: false,
      limit: 6,
      externalGeocoder: function() {
        return Promise.resolve([
          {
            "id":"place.7673410831246050",
            "type":"Feature",
            "place_name":"Promise: Washington, District of Columbia, United States of America",
            "geometry":{"type":"Point","coordinates":[-77.0366,38.895]}
          }
        ])
      }
    });

    const wait = new Promise(resolve => {
      geocoder.once(
        'results',
        function(e) {
          // External geocoder used
          expect(e.features.length).toEqual(7);

          geocoder.once(
            'results',
            function(e) {
              // External geocoder supplement remote response
              expect(e.features.length).toEqual(7);

              geocoder.query('District of Columbia');
              geocoder.once(
                'results',
                function(e) {
                  // External geocoder results above remote response
                  expect(e.features[0].place_name).toEqual('Promise: Washington, District of Columbia, United States of America');
                  resolve();
                }
              );
            }
          );
          geocoder.query('DC');
        }
      );
    });
    geocoder.query('Washington, DC');
    return wait;
  });

  test('country bbox', function() {
    setup({});
    var fitBoundsSpy = sinon.spy(map, "fitBounds");
    const wait = new Promise(resolve => {
      geocoder.once(
        'result',
        function(e) {
          // map#fitBounds was called when a country-level feature was returned
          expect(fitBoundsSpy.calledOnce).toBeTruthy()
          var fitBoundsArgs = fitBoundsSpy.args[0][0];
          // flatten
          var mapBBox = [fitBoundsArgs[0][0], fitBoundsArgs[0][1], fitBoundsArgs[1][0], fitBoundsArgs[1][1]];
          expect(mapBBox.some(function(coord, i) {
            return coord.toPrecision(4) === e.result.bbox[i].toPrecision(4);
          })).toBeTruthy();
          resolve();
        }
      );
    });
    geocoder.query('Spain');
    return wait;
  });

  test('country bbox exception', function() {
    setup({});
    var fitBoundsSpy = sinon.spy(map, "fitBounds");
    const wait = new Promise(resolve => {
      geocoder.on(
        'result',
        once(function() {
          // the map#fitBounds method was called when an excepted feature was returned
          expect(fitBoundsSpy.calledOnce).toBeTruthy();
          var fitBoundsArgs = fitBoundsSpy.args[0][0];
          // flatten
          var mapBBox = [fitBoundsArgs[0][0], fitBoundsArgs[0][1], fitBoundsArgs[1][0], fitBoundsArgs[1][1]];
          var expectedBBox = exceptions['ca'].bbox;
          var expectedBBoxFlat = [expectedBBox[0][0], expectedBBox[0][1], expectedBBox[1][0], expectedBBox[1][1]]
          expect(mapBBox.some(function(coord, i) {
            return coord.toPrecision(4) === expectedBBoxFlat[i].toPrecision(4);
          })).toBeTruthy();
          resolve();
        })
      );
    });
    geocoder.query('Canada');
    return wait;
  });

  test('lint exceptions file', function() {
    for (var id in exceptions) {
      var ex = exceptions[id];
      // exception includes place name
      expect(ex.name).toBeTruthy();
      // exception includes bbox
      expect(ex.bbox).toBeTruthy();
      // exception bbox is array
      expect(Array.isArray(ex.bbox)).toBeTruthy();
      // exception bbox has two corners
      expect(ex.bbox.length).toEqual(2);
      // exception bbox corners each have two components
      expect(ex.bbox.every(function(corner) {
        return Array.isArray(corner) && corner.length === 2;
      })).toBeTruthy();
    }
  });

  test.skip('options.filter', function() {
    /* testing filter by searching for a place Heathcote in New South Wales, Australia,
     * which also exists in a part of Victoria which is still inside the New South Wales bbox. */
    setup({
      countries: 'au',
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

    const wait = new Promise(resolve => {
      geocoder.once(
        'results',
        function(e) {
          // feature included in filter
          expect(e.features
            .map(function(feature) {
              return feature.place_name;
            })
            .includes('Heathcote Avenue')).toBeTruthy();
          // feature excluded in filter
          expect(e.features
            .map(function(feature) {
              return feature.place_name;
            })
            .includes('Heathcote, Victoria, Australia')).toBeFalsy();
          resolve();
        }
      );
    });
    geocoder.query('Heathcote');
    return wait;
  });

  test('options.trackProximity', function() {
    setup({
      trackProximity: true
    });

    map.setZoom(10);
    map.setCenter([15, 10]);
    // proximity updates after setCenter
    expect(
      geocoder.getProximity()
    ).toStrictEqual(
      { longitude: 15, latitude: 10 }
    );

    map.setZoom(9);
    // proximity unset after zooming out
    expect(geocoder.getProximity()).toBeFalsy();
    // trackProximity remains enabled after it automatically updates proximity
    expect(geocoder.options.trackProximity).toBeTruthy()
  });

  test('options.trackProximity=false', function() {
    setup({
      trackProximity: false
    });
    // track proximity is set to false
    expect(geocoder.options.trackProximity).toBeFalsy();
    // proximity is not available when trackProximity is set to false
    expect(geocoder.getProximity()).toBeFalsy();
  });

  test('options.setProximity', function() {
    setup({});

    // trackProximity is set to true by default
    expect(geocoder.options.trackProximity).toBeTruthy()
    map.setZoom(13);
    map.setCenter([-79.4512, 43.6568]);
    geocoder.setProximity({ longitude: -79.4512, latitude: 43.6568});
    // trackProximity is set to false after explicitly setting proximity
    expect(geocoder.options.trackProximity).toBeFalsy()

    const wait = new Promise(resolve => {
      geocoder.once(
        'results',
        function(e) {
          // proximity applied in geocoding request
          expect(e.features[0].place_name.indexOf('Toronto') !== -1).toBeTruthy();
          // Move map and make sure _updateProximity not still changing proximity
          map.setCenter([0,0]);
          map.setZoom(5);
          geocoder.once(
            'results',
            function(e) {
              // explicitly-set proximity remains intact after moving map
              expect(e.features[0].place_name.indexOf('Toronto') !== -1).toBeTruthy()
              resolve();
            }
          );
          geocoder.query('high');
        }
      );
    });
    geocoder.query('high');
    return wait;
  });

  test('geocoding works correctly around a place with a 0 lat or lng', function() {
    setup({});

    map.setZoom(13);
    map.setCenter([0, 51.5]);

    const wait = new Promise(resolve => {
      geocoder.once(
        'results',
        function(e) {
          // geocoding works correctly around a location with a 0 lat or lng
          expect(e.features.some((feature) => feature.place_name.indexOf('Berlin') !== -1)).toBeTruthy();
          resolve();
        }
      );
    });
    geocoder.query('Berlin');
    return wait;
  });

  test('proximity can be set to a value with a 0 lat or lng', function() {
    setup({});

    map.setZoom(13);
    map.setCenter([32.58, 0]);
    geocoder.setProximity({ longitude: 32.58, latitude: 0});

    geocoder.once(
      'results',
      function(e) {
        // proximity applied correctly to location including a zero in geocoding request
        expect(e.features[0].place_name.indexOf('Entebbe') !== -1).toBeTruthy();
      }
    );
    geocoder.query('ent');
  });

  test('proximity can be set to a value of "ip"', function() {
    setup({trackProximity: false});

    geocoder.setProximity('ip');

    const wait = new Promise(resolve => {
      geocoder.once(
        'results',
        function(e) {
          // proximity=ip successfully returned results
          expect(e.features.length > 0).toBeTruthy();
          resolve();
        }
      );
    });
    geocoder.query('par');
    return wait;
  });

  test('options.render', function() {
    setup({
      render: function(feature){
        return 'feature id is ' + feature.id
      }
    });

    var fixture = {
      id: 'abc123',
      place_name: 'San Francisco, California'
    }

    // sets the render function on the typeahead
    expect(geocoder._typeahead.render).toBeTruthy();
    // the render function on the typeahead is a function
    expect(typeof(geocoder._typeahead.render)).toEqual('function');
    // render function is applied properly on the typeahead
    expect(geocoder._typeahead.render(fixture)).toEqual('feature id is abc123');
  })

  test('setRenderFunction with no input', function() {
    setup({});
    var result = geocoder.setRenderFunction();
    // render function is set even when no input is passed
    expect(typeof(geocoder._typeahead.render)).toEqual('function');
    // setRenderFunction always returns a MapboxGeocoder instance
    expect(result instanceof MapboxGeocoder).toBeTruthy();
  });

  test('setRenderFunction with function input', function() {
    setup({});
    var result = geocoder.setRenderFunction(function(item){return item.place_name});
    // render function is set
    expect(typeof(geocoder._typeahead.render)).toEqual('function');
    // setRenderFunction always returns a MapboxGeocoder instance
    expect(result instanceof MapboxGeocoder).toBeTruthy();
  });

  test('getRenderFunction default', function() {
    setup({});
    var result = geocoder.getRenderFunction();
    // value is always returned
    expect(result).toBeTruthy();
    // function is always returned
    expect(typeof(result)).toEqual('function');
  });

  test('getRenderFunction', function() {
    setup({render: function(item){return item.place_name}});
    var result = geocoder.getRenderFunction();
    // value is returned when a custom function is set
    expect(result).toBeTruthy();
    // function is returned  when a custom function is set
    expect(typeof(result)).toEqual('function');
  });

  test('options.getItemValue', function() {
    setup({
      getItemValue: function(feature){
        return 'feature id is ' + feature.id
      }
    });

    var fixture = {
      id: 'abc123',
      place_name: 'San Francisco, California'
    }

    // sets the get item function on the typeahead
    expect(geocoder._typeahead.getItemValue).toBeTruthy();
    // the getItemValue on the typeahead is a function
    expect(typeof(geocoder._typeahead.getItemValue)).toEqual('function');
    // getItemValue function is applied properly on the typeahead
    expect(geocoder._typeahead.getItemValue(fixture)).toEqual('feature id is abc123');
  });

  test('options.getItemValue default', function() {
    setup({});

    var fixture = {
      id: 'abc123',
      place_name: 'San Francisco, California'
    }

    // the get item function on the typeahead is set by default
    expect(geocoder._typeahead.getItemValue).toBeTruthy();
    // the getItemValue on the typeahead is a function by default
    expect(typeof(geocoder._typeahead.getItemValue)).toEqual('function');
    // the getItemValue uses the place_name by default
    expect(geocoder._typeahead.getItemValue(fixture)).toEqual('San Francisco, California');
  });

  test('options.flyTo [false]', function() {
    setup({
      flyTo: false
    });

    var mapFlyMethod =  sinon.spy(map, "flyTo");
    const wait = new Promise(resolve => {
      geocoder.once(
        'result',
        function() {
          // The map flyTo was not called when the option was set to false
          expect(mapFlyMethod.notCalled).toBeTruthy();
          resolve();
        }
      );
    });
    geocoder.query('Golden Gate Bridge');
    return wait;
  });

  test('options.flyTo [true]', function() {
    setup({
      flyTo: true
    });

    var mapFlyMethod =  sinon.spy(map, "flyTo");
    const wait = new Promise(resolve => {
      geocoder.once(
        'result',
        function() {
          // The map flyTo was called when the option was set to true
          expect(mapFlyMethod.calledOnce).toBeTruthy();
          var calledWithArgs = mapFlyMethod.args[0][0];
          // the map is directed to fly to the right longitude
          expect(+calledWithArgs.center[0].toFixed(4)).toEqual(+-(122.4802).toFixed(4));
          // the map is directed to fly to the right latitude
          expect(+calledWithArgs.center[1].toFixed(4)).toEqual(+(37.8317).toFixed(4));
          // the map is directed to fly to the right zoom
          expect(calledWithArgs.zoom).toEqual(16);
          resolve();
        }
      );
    });
    geocoder.query('Golden Gate Bridge');
    return wait;
  });

  test('options.flyTo [object]', function() {
    setup({
      flyTo: {
        speed: 5,
        zoom: 4,
        center: [0, 0]
      }
    });

    var mapFlyMethod =  sinon.spy(map, "flyTo");
    const wait = new Promise(resolve => {
      geocoder.once(
        'result',
        function() {
          // The map flyTo was called when the option was set to true
          expect(mapFlyMethod.calledOnce).toBeTruthy();
          var calledWithArgs = mapFlyMethod.args[0][0];
          // the map is directed to fly to the right longitude
          expect(+calledWithArgs.center[0].toFixed(4)).toEqual(+-(122.4802).toFixed(4));
          // the map is directed to fly to the right latitude
          expect(+calledWithArgs.center[1].toFixed(4)).toEqual(+(37.8317).toFixed(4));        // the selected result overrides the constructor zoom option
          expect(calledWithArgs.zoom).toEqual(4);
          // speed argument is passed to the flyTo method
          expect(calledWithArgs.speed).toEqual(5);
          resolve();
        }
      );
    });
    geocoder.query('Golden Gate Bridge');
    return wait;
  });


  test('options.flyTo object on feature with bounding box', function() {
    setup({
      flyTo: {
        speed: 5
      }
    });

    var mapFlyMethod =  sinon.spy(map, "fitBounds");
    const wait = new Promise(resolve => {
      geocoder.once(
        'result',
        function() {
          // The map flyTo was called when the option was set to true
          expect(mapFlyMethod.calledOnce).toBeTruthy();
          var calledWithArgs = mapFlyMethod.args[0][1];
          // speed argument is passed to the flyTo method
          expect(calledWithArgs.speed).toEqual(5);
          resolve();
        }
      );
    });
    geocoder.query('Brazil');
    return wait;
  });


  test('options.flyTo object on bounding box excepted feature', function() {
    setup({
      flyTo: {
        speed: 5
      }
    });

    var mapFlyMethod =  sinon.spy(map, "fitBounds");
    const wait = new Promise(resolve => {
      geocoder.once(
        'result',
        function() {
          // The map flyTo was called when the option was set to true
          expect(mapFlyMethod.calledOnce).toBeTruthy();
          var calledWithArgs = mapFlyMethod.args[0][1];
          // speed argument is passed to the flyTo method
          expect(calledWithArgs.speed).toEqual(5);
          resolve();
        }
      );
    });
    geocoder.query('Canada');
    return wait;
  });

  test('placeholder localization', function() {
    var ensureLanguages = ['de', 'en', 'fr', 'it', 'nl', 'ca', 'cs', 'fr', 'he', 'hu', 'is', 'ja', 'ka', 'ko', 'lv', 'ka', 'ko', 'lv', 'nb', 'pl', 'pt', 'sk', 'sl', 'sr', 'th', 'zh'];
    ensureLanguages.forEach(function(languageTag){
      expect(typeof(localization.placeholder[languageTag])).toEqual('string');
    });
  });

  test('options.marker [true]', function() {
    setup({
      marker: true,
      mapboxgl: mapboxgl
    });
    var markerConstructorSpy = sinon.spy(mapboxgl, "Marker");

    const wait = new Promise(resolve => {
      geocoder.once(
        'result',
        function() {
          // a new marker is added to the map
          expect(markerConstructorSpy.calledOnce).toBeTruthy();
          var calledWithOptions = markerConstructorSpy.args[0][0];
          // a default color is set
          expect(calledWithOptions.color).toEqual('#4668F2');
          markerConstructorSpy.restore();
          resolve();
        }
      );
    });
    geocoder.query('high');
    return wait;
  });

  test('options.marker  [constructor properties]', function() {
    setup({
      marker: {
        color: "purple",
        draggable: true,
        anchor: 'top'
      },
      mapboxgl: mapboxgl
    });
    var markerConstructorSpy = sinon.spy(mapboxgl, "Marker");

    const wait = new Promise(resolve => {
      geocoder.once(
        'result',
        function() {
          // a new marker is added to the map
          expect(markerConstructorSpy.calledOnce).toBeTruthy();
          var calledWithOptions = markerConstructorSpy.args[0][0];
          // sets the correct color property
          expect(calledWithOptions.color).toEqual('purple');
          // sets the correct draggable property
          expect(calledWithOptions.draggable).toEqual(true);
          // default anchor is overriden by custom properties
          expect(calledWithOptions.anchor).toEqual('top');
          markerConstructorSpy.restore();
          resolve();
        }
      );
    });
    geocoder.query('high');
    return wait;
  });

  test('options.marker [false]', function() {
    setup({
      marker: false
    });
    var markerConstructorSpy = sinon.spy(mapboxgl, "Marker");

    const wait = new Promise(resolve => {
      geocoder.once(
        'result',
        function() {
          // a new marker is not added to the map
          expect(markerConstructorSpy.notCalled).toBeTruthy();
          markerConstructorSpy.restore();
          resolve();
        }
      );
    });
    geocoder.query('high');
    return wait;
  });

  test('geocode#onRemove', function() {
    setup({marker: true});

    var removeMarkerMethod = sinon.spy(geocoder, "_removeMarker");

    geocoder.onRemove();

    // markers are removed when the plugin is removed
    expect(removeMarkerMethod.calledOnce).toBeTruthy();
    // the map context is removed from the geocoder when the plugin is removed
    expect(geocoder._map).toEqual(null);
  });

  test('geocoder#setLanguage', function() {
    setup({language: 'de-DE'});
    // the correct language is set on initialization
    expect(geocoder.options.language).toEqual('de-DE');
    geocoder.setLanguage('en-US');
    // the language is changed in the geocoder options
    expect(geocoder.options.language).toEqual('en-US');
  });

  test('geocoder#getLanguage', function() {
    setup({language: 'de-DE'});
    // getLanguage returns the right language
    expect(geocoder.getLanguage()).toEqual('de-DE');
  });

  test('geocoder#getZoom', function() {
    setup({zoom: 12});
    // getZoom returns the right zoom
    expect(geocoder.getZoom()).toEqual(12);
  });

  test('geocoder#setZoom', function() {
    setup({zoom: 14});
    // the correct zoom is set on initialization
    expect(geocoder.options.zoom).toEqual(14);
    geocoder.setZoom(17);
    // the zoom is changed in the geocoder options
    expect(geocoder.options.zoom).toEqual(17);
  });

  test('geocoder#getFlyTo', function() {
    setup({flyTo: false});
    // getFlyTo returns the right value
    expect(geocoder.getFlyTo()).toEqual(false);
  });

  test('geocoder#setFlyTo', function(){
    setup({flyTo: false});
    // the correct flyTo option is set on initialization
    expect(geocoder.options.flyTo).toEqual(false);
    geocoder.setFlyTo({speed: 25});
    // the flyTo option is changed in the geocoder options
    expect(geocoder.options.flyTo).toEqual({speed: 25});
  });

  test('geocoder#getPlaceholder', function() {
    setup({placeholder: 'Test'});
    // getPlaceholder returns the right value
    expect(geocoder.getPlaceholder()).toEqual('Test');
  });

  test('geocoder#setPlaceholder', function() {
    setup({placeholder: 'Test'});
    // the right placeholder is set on initialization
    expect(geocoder._inputEl.placeholder).toEqual('Test');
    geocoder.setPlaceholder('Search');
    // the placeholder was changed in the  UI element
    expect(geocoder._inputEl.placeholder).toEqual('Search');
    // the placeholder returned from getPlaceholder is the right value
    expect(geocoder.getPlaceholder()).toEqual('Search');
  });

  test('geocoder#getBbox', function(){
    setup({bbox: [-1,-1,1,1]});
    // getBbox returns the right bounding box
    expect(geocoder.getBbox()).toEqual([-1, -1, 1, 1]);
  });

  test('geocoder#setBbox', function() {
    setup({bbox: [-1,-1,1,1]});
    // getBbox returns the right bounding box
    expect(geocoder.options.bbox).toEqual([-1, -1, 1, 1]);
    geocoder.setBbox([-2, -2, 2, 2])
    // the bounding box option is changed in the geocoder options
    expect(geocoder.options.bbox).toEqual([-2, -2, 2, 2]);
  });

  test('geocoder#getCountries', function() {
    setup({countries: 'ca,us'})
    // getCountries returns the right country list
    expect(geocoder.getCountries()).toEqual('ca,us');
  });

  test('geocoder#setCountries', function() {
    setup({countries:'ca'});
    // the right countries are set on initialization
    expect(geocoder.options.countries).toEqual('ca');
    geocoder.setCountries("ca,us");
    // the countries option is changed in the geocoder options
    expect(geocoder.options.countries).toEqual('ca,us');
  });

  test('geocoder#getTypes', function() {
    setup({types: 'poi'});
    // getTypes returns the right types list
    expect(geocoder.getTypes()).toEqual('poi');
  });

  test('geocoder#setTypes', function(){
    setup({types: 'poi'});
    // the  right types are set on initializations
    expect(geocoder.options.types).toEqual('poi');
    geocoder.setTypes("place,poi");
    // the types list is changed in the geocoder options
    expect(geocoder.options.types).toEqual('place,poi');
  });

  test('geocoder#getLimit', function() {
    setup({limit:4});
    // getLimit returns the right limit value
    expect(geocoder.getLimit()).toEqual(4);
  });

  test('geocoder#setLimit', function() {
    setup({limit: 1});
    // the correct limit is set on initialization
    expect(geocoder.options.limit).toEqual(1);
    // the correct limit is set on the typeahead
    expect(geocoder._typeahead.options.limit).toEqual(1);
    geocoder.setLimit(4);
    // the limit is updated in the geocoder options
    expect(geocoder.options.limit).toEqual(4);
    // the limit is updated in the typeahead options
    expect(geocoder._typeahead.options.limit).toEqual(4);
  });

  test('geocoder#getFilter', function() {
    setup({filter: function(){ return false}});
    var filter = geocoder.getFilter();
    // the filter is a function
    expect(typeof(filter)).toEqual('function');
    // the correct filter is applied
    expect(['a', 'b', 'c'].filter(filter)).toEqual([]);
  });

  test('geocoder#setFilter', function(){
    setup({filter: function(){return true}});
    var initialFilter = geocoder.getFilter();
    var filtered = ['a', 'b', 'c'].filter(initialFilter);
    // the initial filter is a function
    expect(typeof(initialFilter)).toEqual('function');
    // the initial filter is correctly applied
    expect(filtered).toEqual(['a', 'b', 'c']);
    geocoder.setFilter(function(){return false});
    var nextFilter = geocoder.options.filter;
    var nextFiltered = ['a', 'b', 'c'].filter(nextFilter);
    // the next filter is a function
    expect(typeof(nextFilter)).toEqual('function');
    // the changed filter is correctly applied
    expect(nextFiltered).toEqual([]);
  });

  test('geocoder#autocomplete default results', function() {
    setup();
    const wait = new Promise(resolve => {
      geocoder.once('results', function(e) {
        // autocomplete is enabled in default responses
        expect(e.features.some(feature => feature.place_name.indexOf('Indiana') !== -1 )).toBeTruthy();
        resolve();
      });
    });
    geocoder.query('India');
    return wait;
  });

  test('geocoder#getAutocomplete', function() {
    setup({autocomplete: false});
    // getAutocomplete returns the correct autocomplete value
    expect(geocoder.getAutocomplete()).toEqual(false);
  });

  test('geocoder#setAccessToken', function(){
    const accessToken = import.meta.env.MapboxAccessToken;
    setup({ accessToken: `${accessToken}#foo` });
    geocoder.setAccessToken(accessToken);
    const wait = new Promise(resolve => {
      geocoder.once('results', function(e) {
        // new access token applied to requests
        expect(e.request.client.accessToken).toEqual(accessToken);
        resolve();
      });
    });
    geocoder.query('pizza');
    return wait;
  });

  test('geocoder#setAutocomplete', function(){
    setup({autocomplete: false});
    geocoder.setAutocomplete(true);
    // the setAutocomplete changes the autocomplete value in the geocoder options
    expect(geocoder.options.autocomplete).toEqual(true);
    geocoder.setAutocomplete(false);
    const wait = new Promise(resolve => {
      geocoder.once('results', function(e) {
        // disabling autocomplete correctly affects geocoding results
        expect(e.features.every(feature => feature.place_name.indexOf('Indiana') === -1 )).toBeTruthy();
        resolve();
      });
    });
    geocoder.query('India');
    return wait;
  });

  test('geocoder#fuzzyMatch default results', function() {
    setup();
    const wait = new Promise(resolve => {
      geocoder.once('results', function(e) {
        // fuzzyMatch is enabled in default responses
        expect(
          e.features.some(feature => feature.place_name.indexOf('Washington') !== -1 )
        ).toBeTruthy();
        resolve();
      });
    });
    geocoder.query('wahsingtno');
    return wait;
  });

  test('geocoder#getFuzzyMatch', function() {
    setup({fuzzyMatch: false});
    // getFuzzyMatch returns the correct fuzzyMatch value
    expect(geocoder.getFuzzyMatch()).toEqual(false);
  });

  test('geocoder#setFuzzyMatch', function() {
    setup({fuzzyMatch: false});
    geocoder.setFuzzyMatch(true);
    // setFuzzyMatch changes the fuzzyMatch value in the geocoder options
    expect(geocoder.options.fuzzyMatch).toEqual(true);
    geocoder.setFuzzyMatch(false);
    const wait = new Promise(resolve => {
      geocoder.once('results', function(e) {
        // disabling fuzzyMatch correctly affects geocoding results
        expect(e.features.length).toEqual(0);
        resolve();
      });
    });
    geocoder.query('wahsingtno');
    return wait;
  });

  test('geocoder#routing default results', function() {
    setup();
    const wait = new Promise(resolve => {
      geocoder.once('results', function(e) {
        // routing (returning routable_points) is disabled in default responses
        expect(e.features[0].routable_points === undefined).toBeTruthy();
        resolve();
      });
    });
    geocoder.query('The White House');
    return wait;
  });

  test('geocoder#getRouting', function() {
    setup({routing: true});
    // getRouting returns the correct routing value
    expect(geocoder.getRouting()).toEqual(true);
  });

  test.skip('geocoder#setRouting', function(){
    setup({routing: false});
    geocoder.setRouting(true);
    // setRouting changes the routing value in the geocoder options
    expect(geocoder.options.routing).toEqual(true);
    const wait = new Promise(resolve => {
      geocoder.once('results', function(e) {
        // enabling routing returns routable_points in geocoding results
        expect(e.features[0].routable_points !== undefined).toBeTruthy();
        resolve();
      });
    });
    geocoder.query('The White House');
    return wait;
  });

  test('geocoder#worldview default results', function() {
    setup();

    const wait = new Promise(resolve => {
      geocoder.once('results', function(e) {
        // worldview defaults to US in responses
        expect(e.features[0].place_name.indexOf('Taiwan') !== -1).toBeTruthy();
        resolve();
      });
    });

    geocoder.query('Taipei');

    return wait;
  });

  test('geocoder#getWorldview', function() {
    setup({worldview: 'cn'});
    // getWorldview returns the correct worldview value
    expect(geocoder.getWorldview()).toEqual('cn');
  });

  test('geocoder#setWorldview', function(){
    setup({worldview: 'us'});
    geocoder.setWorldview('cn');
    // setWorldview changes the worldview value in the geocoder options
    expect(geocoder.options.worldview).toEqual('cn');

    const wait = new Promise(resolve => {
      geocoder.on('results', once(function(e) {
        // setting worldview correctly affects geocoding results
        expect(e.features[0].place_name.indexOf('China') !== -1).toBeTruthy();
        resolve();
      }));
    });

    geocoder.query('Taipei');

    return wait;
  });

  test('geocoder#_renderMessage', function() {
    setup({});
    var typeaheadRenderErrorSpy = sinon.spy(geocoder._typeahead, 'renderError');

    const wait = new Promise(resolve => {
      geocoder.on(
        'result',
        once(function() {
          setTimeout(function() {
            // the suggestions menu has some options in it after a query
            expect(geocoder._typeahead.data.length).not.toEqual(0);
            geocoder._renderMessage("<h1>This is a test</h1>");
            // the data was cleared from the suggestions
            expect(geocoder._typeahead.data.length).toEqual(0);
            // the selected option was cleared from the suggestions
            expect(geocoder._typeahead.selected).toEqual(null);
            // the renderError method was called exactly once
            expect(typeaheadRenderErrorSpy.calledOnce).toBeTruthy();
            var calledWithArgs = typeaheadRenderErrorSpy.args[0][0];
            // the error rendering function was called with the correct message
            expect(calledWithArgs).toEqual("<h1>This is a test</h1>");
            resolve();
          });
        })
      );
    });

    geocoder.query('high');

    return wait;
  });

  test('geocoder#_renderError', function() {
    setup({});
    var renderMessageSpy = sinon.spy(geocoder, '_renderMessage');

    const wait = new Promise(resolve => {
      geocoder.on(
        'result',
        once(function() {
          geocoder._renderError();
          // the error render method calls the renderMessage method exactly once
          expect(renderMessageSpy.calledOnce).toBeTruthy();
          var calledWithArgs = renderMessageSpy.args[0][0];
          // the error message specifies the correct class
          expect(calledWithArgs.indexOf('mapbox-gl-geocoder--error') > -1).toBeTruthy();

          resolve();
        })
      );
    });

    geocoder.query('high');

    return wait;
  });

  test('geocoder#_renderNoResults', function() {
    setup({});
    var renderMessageSpy = sinon.spy(geocoder, '_renderMessage');

    const wait = new Promise(resolve => {
      geocoder.once(
        'result',
        function() {
          geocoder._renderNoResults();
          // the no results render method calls the renderMessage method exactly once
          expect(renderMessageSpy.calledOnce).toBeTruthy();
          var calledWithArgs = renderMessageSpy.args[0][0];
          // the info message specifies the correct class
          expect(calledWithArgs.indexOf('mapbox-gl-geocoder--error') > -1).toBeTruthy();
          // the info message specifies the correct class
          expect(calledWithArgs.indexOf('mapbox-gl-geocoder--no-results') > -1).toBeTruthy();

          resolve();
        }
      );
    });

    geocoder.query('high');

    return wait;
  });

  test('error is shown after an error occurred', function() {
    setup({});
    const wait = new Promise(resolve => {
      geocoder.on(
        'results',
        function(e) {
          // Some results are returned using and the input is not used for reverse geocoding
          expect(e.features.length > 0).toBeTruthy();
          resolve();
        }
      );
    });

    geocoder.query('12,');

    return wait;
  });

  test('error is shown after an error occurred [with local geocoder]', function() {
    setup({
      localGeocoder: function(){
        return [
          {type:'Feature', geometry: {type: 'Point', coordinates:[-122, 37]}, properties: {}, place_name: 'Golden Gate Bridge', text: 'Golden Gate Bridge', center: [-122, 37]}
        ];
      }
    });

    const wait = new Promise(resolve => {
      geocoder.on(
        'results',
        once(function(e) {
          // Some results are returned using and the input is not used for reverse geocoding
          expect(e.features.length > 0).toBeTruthy();
          resolve();   
        })
      );
    });

    geocoder.query('12,');

    return wait;
  });

  test('message is shown if no results are returned', function() {
    setup({});
    var renderMessageSpy = sinon.spy(geocoder, '_renderNoResults');

    const wait = new Promise(resolve => {
      geocoder.once(
        'results',
        function() {
          // a message was rendered
          expect(renderMessageSpy.called).toBeTruthy();
          resolve();
        }
      );
    });

    geocoder.query('abcdefghijkl!@#$%^&*()_+'); //this will return no results

    return wait;
  });

  test('no mapbox api call is made if localGeocoderOnly is set', function() {
    setup({
      localGeocoderOnly: true,
      localGeocoder: function(q){
        return [{
          place_name: q,
          geometry: {
            type: "Point",
            coordinates: [0, 0]
          },
          properties: {},
          id: 'abc.123'
        }]
      }
    });
    // geocoding service is not initialized during localGeocoderOnly mode
    expect(geocoder.geocoderService).toBeFalsy()

    const wait = new Promise(resolve => {
      geocoder.once(
        'results',
        function(e) {
          // returns the result of the local geocoder
          expect(e.features[0].place_name == "Golden Gate Bridge").toBeTruthy();
          // returns the result of the local geocoder
          expect(e.features[0].id == "abc.123").toBeTruthy();
          // returns the correct number of results
          expect(e.features.length).toEqual(1);

          resolve();
        }
      );
    });

    geocoder.query('Golden Gate Bridge');

    return wait;
  });

  test('does not throw if no access token is set and localGeocoderOnly mode is active', function() {
    var opts =  {
      localGeocoderOnly: true,
      localGeocoder: function(d){
        return [{place_name: d, geometry: {type: "Point", coordinates: [0, 0]}, properties: {}, id: 'abc.123'}]
      }
    }
    // no access token here
    container = document.createElement('div');
    map = new mapboxgl.Map({ container: container });
    geocoder = new MapboxGeocoder(opts);
    expect(function(){map.addControl(geocoder);}, 'does not throw an error when no access token is set').not.toThrowError();
  });

  test('throws an error if localGeocoderOnly mode is active but no localGeocoder is supplied', function(){
    var opts =  {
      localGeocoderOnly: true
    }
    // no access token here
    container = document.createElement('div');
    map = new mapboxgl.Map({ container: container });
    geocoder = new MapboxGeocoder(opts);
    // throws an error if no local geocoder is set
    expect(function(){map.addControl(geocoder);}).toThrowError()
  });

  test('geocoder.lastSelected is reset on input', function() {
    setup();
    geocoder.lastSelected = "abc123";
    geocoder._onKeyDown(new KeyboardEvent('KeyDown'));
    expect(geocoder.lastSelected).toEqual(null)
  });

  test('geocoder#onPaste', function(){
    setup();
    var searchMock = sinon.spy(geocoder, "_geocode")
    const clipboardData = new DataTransfer();
    clipboardData.setData('text/plain', 'Golden Gate Bridge');
    var event = new ClipboardEvent('paste', {
      clipboardData
    })
    geocoder._onPaste(event);
    // the search was triggered
    expect(searchMock.calledOnce).toBeTruthy();
    const queryArg = searchMock.args[0][0];
    // the paste event triggered the correct geocode
    expect(queryArg).toEqual('Golden Gate Bridge');
    searchMock.restore();
  });

  test('geocoder#onPaste not triggered when text is too short', function() {
    setup({
      minLength: 5
    });
    var searchMock = sinon.spy(geocoder, "_geocode")
    const clipboardData = new DataTransfer();
    clipboardData.setData('text/plain', 'abc');
    var event = new ClipboardEvent('paste', {
      clipboardData
    })
    geocoder._onPaste(event);
    // the search was not triggered
    expect(searchMock.calledOnce).toBeFalsy();
    searchMock.restore();
  });

  test('geocoder#onPaste not triggered when there is no text', function() {
    setup();
    var searchMock = sinon.spy(geocoder, "_geocode")
    const clipboardData = new DataTransfer();
    clipboardData.setData('text/plain', '');
    var event = new ClipboardEvent('paste', {
      clipboardData
    })
    geocoder._onPaste(event);
    // the search was not triggered
    expect(searchMock.calledOnce).toBeFalsy();
    searchMock.restore();
  });
});
