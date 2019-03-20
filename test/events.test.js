'use strict';

var test = require('tape');
var MapboxEventsManager = require('./../lib/events');
var sinon = require('sinon');
var MapboxGeocoder = require('../');

test('it constructs a new event manager instance with the correct properties', function (assert) {
  var options = {
    accessToken: 'abc123',
    countries: "CA,US",
    types: "poi,place",
    bbox: [-1, -1, 1, 1],
    language: 'en,fr',
    limit: 2
  }
  var eventsManager = new MapboxEventsManager(options)
  assert.equals(eventsManager.endpoint, '/events/v2', 'the correct event endpoint is set');
  assert.equals(eventsManager.access_token, options.accessToken, 'sets the right access tokens for the request');
  assert.deepEqual(eventsManager.countries, ['CA', 'US'], 'correctly parses the country parameter into an array');
  assert.deepEqual(eventsManager.language, ['en', 'fr'], 'correctly parses the language parameter into an array');
  assert.deepEqual(eventsManager.bbox, [-1, -1, 1, 1], 'correctly parses the bounding box parameter');
  assert.equals(eventsManager.limit, 2, 'correctly parses the language parameter');
  assert.equals(eventsManager.limit, 2, 'correctly parses the language parameter');
  assert.ok(eventsManager.start, 'defines a start event');
  assert.equals(typeof eventsManager.start, 'function', 'start event is a function');
  assert.ok(eventsManager.select, 'defines a select event');
  assert.equals(typeof eventsManager.select, 'function', 'select event is a function');
  assert.equals(typeof eventsManager.version, 'string', 'it has a version string');
  assert.ok(eventsManager.userAgent.startsWith('mapbox-gl-geocoder.0.0.1'), 'has a user agent string of the correct format');
  assert.ok(eventsManager.origin, 'has an origin');
  assert.end();
});

test('send event', function (assert) {
  var eventsManager = new MapboxEventsManager({
    accessToken: 'abc123'
  })
  var requestMethod = sinon.stub(eventsManager, "request").yields(null, {statusCode: 204});

  var payload = {
    event: 'test.event'
  };
  eventsManager.send(payload, function() {
    assert.ok(requestMethod.called, 'the http request was made');
    assert.ok(requestMethod.calledOnce, 'the request method was called exactly once');
    assert.end();
  })
});

test('send event with disabled logging', function (assert) {
  var eventsManager = new MapboxEventsManager({
    accessToken: 'abc123'
  });

  eventsManager.enableEventLogging = false;

  var requestMethod = sinon.stub(eventsManager, "request").yields(null, {statusCode: 204});

  var payload = {
    event: 'test.event'
  };
  eventsManager.send(payload, function () {
    assert.ok(requestMethod.notCalled, 'the http request was not made');
    assert.end();
  })
});

test('get requst options', function(assert){
  var eventsManager = new MapboxEventsManager({
    accessToken: 'abc123'
  })

  var payload = {
    event: 'test.event'
  };
  assert.equals(eventsManager.getRequestOptions(payload).method, 'POST', 'http method is set to POST');
  assert.equals(eventsManager.getRequestOptions(payload).host, 'https://api.mapbox.com', 'http request is made to the right host');
  assert.equals(eventsManager.getRequestOptions(payload).path, '/events/v2?access_token=abc123', 'http request is made to the right host');
  assert.deepEqual(eventsManager.getRequestOptions(payload).headers, {'Content-Type': 'application/json'}, 'content type is json');
  assert.deepEqual(eventsManager.getRequestOptions(payload).body, JSON.stringify([payload]), 'the right payload is set for the request');
  assert.end();
})

test('get event payload', function(assert){
  var geocoder = new MapboxGeocoder({accessToken:'abc123'});
  var eventsManager = new MapboxEventsManager({accessToken: 'abc123'});
  geocoder.inputString = 'my string';
  assert.equals(eventsManager.getEventPayload('test.event', geocoder).event, 'test.event', 'the correct event is set');
  assert.equals(typeof eventsManager.getEventPayload('test.event', geocoder).created, 'number', 'a timestamp is set on the event');
  assert.equals(typeof eventsManager.getEventPayload('test.event', geocoder).sessionIdentifier, 'string', 'the correct event is set');
  assert.equals(eventsManager.getEventPayload('test.event', geocoder).country, null, 'no country is set if no country is set on the geocoder');
  assert.equals(eventsManager.getEventPayload('test.event', geocoder).bbox, null, 'no bbox is set if no country is set on the geocoder');
  assert.equals(eventsManager.getEventPayload('test.event', geocoder).types, null, 'no types is set if no country is set on the geocoder');
  assert.equals(eventsManager.getEventPayload('test.event', geocoder).endpoint, 'mapbox.places', 'the endpoint is always mapbox places');
  assert.equals(eventsManager.getEventPayload('test.event', geocoder).proximity, null, 'no proximity is set if no proximity is set on the geocoder');
  assert.equals(eventsManager.getEventPayload('test.event', geocoder).limit, 5, 'the limit is set to the prototype default if other limit is set');
  assert.equals(eventsManager.getEventPayload('test.event', geocoder).queryString, 'my string', 'the query string is found from the geocoder');
  assert.end();
});

test('get event payload with geocoder options', function(assert){
  var options = {
    accessToken: 'abc123',
    countries: "CA,US",
    types: "poi,place",
    bbox: [-1, -1, 1, 1],
    language: 'en,fr',
    limit: 2,
    proximity: {latitude: 1, longitude: 2}
  }
  var geocoder = new MapboxGeocoder(options);
  var eventsManager = new MapboxEventsManager(options);
  geocoder.inputString = 'my string';
  assert.equals(eventsManager.getEventPayload('test.event', geocoder).event, 'test.event', 'the correct event is set');
  assert.equals(typeof eventsManager.getEventPayload('test.event', geocoder).created, 'number', 'a timestamp is set on the event');
  assert.equals(typeof eventsManager.getEventPayload('test.event', geocoder).sessionIdentifier, 'string', 'the correct event is set');
  assert.deepEqual(eventsManager.getEventPayload('test.event', geocoder).country, ['CA', 'US'], 'no country is set if no country is set on the geocoder');
  assert.deepEqual(eventsManager.getEventPayload('test.event', geocoder).bbox, [-1, -1, 1,1], 'no bbox is set if no country is set on the geocoder');
  assert.deepEqual(eventsManager.getEventPayload('test.event', geocoder).types, ['poi', 'place'], 'no types is set if no country is set on the geocoder');
  assert.equals(eventsManager.getEventPayload('test.event', geocoder).endpoint, 'mapbox.places', 'the endpoint is always mapbox places');
  assert.deepEqual(eventsManager.getEventPayload('test.event', geocoder).proximity, [2, 1], 'no proximity is set if no proximity is set on the geocoder');
  assert.equals(eventsManager.getEventPayload('test.event', geocoder).limit, 2, 'the limit is set to the prototype default if other limit is set');
  assert.equals(eventsManager.getEventPayload('test.event', geocoder).queryString, 'my string', 'the query string is found from the geocoder');
  assert.end();
});

test('search start event', function(assert){
  var eventsManager = new MapboxEventsManager({
    accessToken: 'abc123'
  })
  var sendMethod = sinon.spy(eventsManager, "send")
  var requestMethod = sinon.stub(eventsManager, "request").yields(null, {statusCode: 204});
  var geocoder = new MapboxGeocoder({accessToken: 'abc123'});
  eventsManager.start(geocoder, function () {
    assert.ok(requestMethod.called, 'the http request was initated');
    assert.ok(requestMethod.calledOnce, 'the send method was called exactly once');
    var calledWithArgs = sendMethod.args[0][0];
    assert.ok(calledWithArgs.event, 'search.start', 'sends the correct event type')
    assert.end();
  })
});

test('search selects event', function(assert){
  var eventsManager = new MapboxEventsManager({
    accessToken: 'abc123'
  })
  var sendMethod = sinon.spy(eventsManager, "send")
  var requestMethod = sinon.stub(eventsManager, "request").yields(null, {statusCode: 204});
  var geocoder = new MapboxGeocoder({accessToken: 'abc123'});
  eventsManager.start(geocoder, function () {
    assert.ok(requestMethod.called, 'the http request was initated');
    assert.ok(requestMethod.calledOnce, 'the send method was called exactly once');
    var calledWithArgs = sendMethod.args[0][0];
    assert.ok(calledWithArgs.event, 'search.select', 'sends the correct event type')
    assert.end();
  })
})

test('generate session id', function(assert){
  var eventsManager = new MapboxEventsManager({
    accessToken: 'abc123'
  })
  assert.ok(typeof eventsManager.generateSessionID(), 'string', 'generates a string id');
  assert.notEqual(eventsManager.generateSessionID(), eventsManager.generateSessionID(), 'session id is generated randomly');
  assert.equals(eventsManager.generateSessionID().length, 21, 'generates an ID of the correct length');
  assert.end();
});


test('get user agent', function(assert){
  var eventsManager = new MapboxEventsManager({
    accessToken: 'abc123'
  })
  assert.ok(typeof eventsManager.getUserAgent(), 'string', 'returns a string');
  assert.ok( eventsManager.getUserAgent().includes('mapbox-gl-geocoder.'), 'includes an sdk identifier');
  assert.end();
});

test('get selected index', function(assert){
  var needle = {id: 'abc.123'};
  var haystack = [{id: 'abc.999'}, {id: 'abc.123'}, {id: 'abc.888'}, {id: 'abc.777'}, {id: 'abc.666'}];
  var eventsManager = new MapboxEventsManager({
    accessToken: 'abc123'
  })
  var geocoder = new MapboxGeocoder({accessToken: 'abc123'});
  geocoder._typeahead = {
    data: haystack
  };
  assert.ok(typeof eventsManager.getSelectedIndex(needle, geocoder), 'number', 'returns the right type');
  assert.equals( eventsManager.getSelectedIndex(needle, geocoder), 1, 'returns the right index');
  assert.end();
});

test('should enable logging', function(assert) {
  var nonMapboxOptions = {
    accessToken: 'abc123',
    origin: 'https://my.server.endpoint'
  }
  var eventsManager = new MapboxEventsManager(nonMapboxOptions);
  assert.false(eventsManager.shouldEnableLogging(nonMapboxOptions), 'logging is not enabled when origin is not mapbox');
  var mapboxOptions = {
    accessToken: 'abc123',
    origin: 'https://api.mapbox.com'
  }
  var eventsManagerMapbox = new MapboxEventsManager(mapboxOptions);
  assert.true(eventsManagerMapbox.shouldEnableLogging(mapboxOptions), 'logging is enabled when origin is mapbox');

  mapboxOptions.filter = function(){return true};
  assert.false(eventsManagerMapbox.shouldEnableLogging(mapboxOptions), 'logging is disabled when a custom filter is enabled');

  mapboxOptions.filter = undefined;
  mapboxOptions.localGeocoder = function(){return 'abc'}
  assert.false(eventsManagerMapbox.shouldEnableLogging(mapboxOptions), 'logging is disabled when a custom geocoder is enabled');

  assert.end();
})
