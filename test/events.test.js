import { test, expect } from 'vitest';
import sinon from 'sinon';
import MapboxEventsManager from './../lib/events';
import MapboxGeocoder from './../';

test('it constructs a new event manager instance with the correct properties', function () {
  var options = {
    accessToken: 'abc123',
    countries: "CA,US",
    types: "poi,place",
    bbox: [-1, -1, 1, 1],
    language: 'en,fr',
    limit: 2
  }
  var eventsManager = new MapboxEventsManager(options)
  expect(eventsManager.origin).toEqual('https://api.mapbox.com');
  expect(eventsManager.endpoint).toEqual('events/v2');
  expect(eventsManager.access_token).toEqual(options.accessToken);
  expect(eventsManager.countries).toEqual(['CA', 'US']);
  expect(eventsManager.language).toEqual(['en', 'fr']);
  expect(eventsManager.bbox).toEqual([-1, -1, 1, 1]);
  expect(eventsManager.limit).toEqual(2);
  expect(eventsManager.limit).toEqual(2);
  expect(eventsManager.start).toBeTruthy();
  expect(typeof eventsManager.start).toEqual('function');
  expect(eventsManager.select).toBeTruthy();
  expect(typeof eventsManager.select).toEqual('function');
  expect(typeof eventsManager.keyevent).toEqual('function');
  expect(typeof eventsManager.version).toEqual('string');
  expect(eventsManager.flushInterval).toEqual(1000);
  expect(eventsManager.maxQueueSize).toEqual(100);
  expect(eventsManager.userAgent.startsWith('mapbox-gl-geocoder.0.3.0')).toBeTruthy();
  expect(eventsManager.origin).toBeTruthy();
  expect(eventsManager.options).toEqual(options);
});

test('send event', function () {
  var eventsManager = new MapboxEventsManager({
    accessToken: 'abc123'
  })
  var requestMethod = sinon.stub(eventsManager, "request").yields(null, {statusCode: 204});

  var payload = {
    event: 'test.event'
  };
  eventsManager.send(payload, function() {
    expect(requestMethod.called).toBeTruthy();
    expect(requestMethod.calledOnce).toBeTruthy();
  })
});

test('send event with disabled logging', function () {
  var eventsManager = new MapboxEventsManager({
    accessToken: 'abc123'
  });

  eventsManager.enableEventLogging = false;

  var requestMethod = sinon.stub(eventsManager, "request").yields(null, {statusCode: 204});

  var payload = {
    event: 'test.event'
  };
  eventsManager.send(payload, function () {
    expect(requestMethod.notCalled).toBeTruthy();
  })
});

test('get request options', function(){
  var eventsManager = new MapboxEventsManager({
    accessToken: 'abc123'
  })

  var payload = {
    event: 'test.event'
  };
  expect(eventsManager.getRequestOptions(payload).method).toEqual('POST');
  expect(eventsManager.getRequestOptions(payload).host).toEqual('https://api.mapbox.com');
  expect(eventsManager.getRequestOptions(payload).path).toEqual('events/v2?access_token=abc123');
  expect(eventsManager.getRequestOptions(payload).headers).toEqual({'Content-Type': 'application/json'});
  expect(eventsManager.getRequestOptions(payload).body).toEqual(JSON.stringify([payload]));
})

test('get event payload', function(){
  var geocoder = new MapboxGeocoder({accessToken:'abc123'});
  var eventsManager = new MapboxEventsManager({accessToken: 'abc123'});
  geocoder.inputString = 'my string';
  expect(eventsManager.getEventPayload('test.event', geocoder).event).toEqual('test.event');
  expect(eventsManager.getEventPayload('test.event', geocoder).version).toEqual('2.0');
  expect(typeof eventsManager.getEventPayload('test.event', geocoder).created).toEqual('number');
  expect(
    typeof eventsManager.getEventPayload('test.event', geocoder).sessionIdentifier
  ).toEqual('string');
  expect(eventsManager.getEventPayload('test.event', geocoder).country).toEqual(null);
  expect(eventsManager.getEventPayload('test.event', geocoder).bbox).toEqual(null);
  expect(eventsManager.getEventPayload('test.event', geocoder).types).toEqual(null);
  expect(eventsManager.getEventPayload('test.event', geocoder).endpoint).toEqual('mapbox.places');
  expect(eventsManager.getEventPayload('test.event', geocoder).proximity).toEqual(null);
  expect(eventsManager.getEventPayload('test.event', geocoder).limit).toEqual(5);
  expect(eventsManager.getEventPayload('test.event', geocoder).queryString).toEqual('my string');
});

test('get event payload with geocoder options', function(){
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
  expect(eventsManager.getEventPayload('test.event', geocoder).event).toEqual('test.event');
  expect(typeof eventsManager.getEventPayload('test.event', geocoder).created).toEqual('number');
  expect(
    typeof eventsManager.getEventPayload('test.event', geocoder).sessionIdentifier
  ).toEqual('string');
  expect(eventsManager.getEventPayload('test.event', geocoder).country).toEqual(['CA', 'US']);
  expect(eventsManager.getEventPayload('test.event', geocoder).bbox).toEqual([-1, -1, 1,1]);
  expect(eventsManager.getEventPayload('test.event', geocoder).types).toEqual(['poi', 'place']);
  expect(eventsManager.getEventPayload('test.event', geocoder).endpoint).toEqual('mapbox.places');
  expect(eventsManager.getEventPayload('test.event', geocoder).proximity).toEqual([2, 1]);
  expect(eventsManager.getEventPayload('test.event', geocoder).limit).toEqual(2);
  expect(eventsManager.getEventPayload('test.event', geocoder).queryString).toEqual('my string');
});

test('get event payload with geocoder options - proximity=ip', function(){
  var options = {
    accessToken: 'abc123',
    proximity: 'ip'
  }
  var geocoder = new MapboxGeocoder(options);
  geocoder._headers = { 'ip-proximity': '3,4' }
  var eventsManager = new MapboxEventsManager(options);
  geocoder.inputString = 'my string';
  expect(eventsManager.getEventPayload('test.event', geocoder).event).toEqual('test.event');
  expect(typeof eventsManager.getEventPayload('test.event', geocoder).created).toEqual('number');
  expect(
    typeof eventsManager.getEventPayload('test.event', geocoder).sessionIdentifier
  ).toEqual('string');
  expect(eventsManager.getEventPayload('test.event', geocoder).endpoint).toEqual('mapbox.places');
  expect(eventsManager.getEventPayload('test.event', geocoder).proximity).toEqual([3, 4]);
  expect(eventsManager.getEventPayload('test.event', geocoder).queryString).toEqual('my string');
});

test('search start event', function(){
  var eventsManager = new MapboxEventsManager({
    accessToken: 'abc123'
  })
  var sendMethod = sinon.spy(eventsManager, "send");
  var pushMethod = sinon.spy(eventsManager, "push");
  var requestMethod = sinon.stub(eventsManager, "request").yields(null, {statusCode: 204});
  var geocoder = new MapboxGeocoder({accessToken: 'abc123'});
  geocoder.inputString = "My String";
  eventsManager.start(geocoder);
  expect(pushMethod.called).toBeTruthy();
  expect(sendMethod.called).toBeFalsy();
  var calledWithArgs = pushMethod.args[0][0];
  expect(calledWithArgs.event).toEqual('search.start');
  expect(calledWithArgs.version).toEqual('2.0');
  sendMethod.restore();
  pushMethod.restore();
  requestMethod.restore();
});

test('search selects event', function(){
  var eventsManager = new MapboxEventsManager({
    accessToken: 'abc123'
  })
  var sendMethod = sinon.spy(eventsManager, "send")
  var requestMethod = sinon.stub(eventsManager, "request").yields(null, {statusCode: 204});
  var pushMethod = sinon.spy(eventsManager, "push");
  var geocoder = new MapboxGeocoder({accessToken: 'abc123'});
  geocoder._typeahead = {
    data: [
      {id: 'place.1', place_name: 'Place A', place_type: ['place'], properties: { mapbox_id: 'mapboxId1' }, _source: 'mapbox'},
      {id: 'place.2', place_name: 'Place B', place_type: ['place'], properties: { mapbox_id: 'mapboxId2' }, _source: 'mapbox'},
      {id: 'place.3', place_name: 'Place C', place_type: ['place'], properties: { mapbox_id: 'mapboxId3' }, _source: 'mapbox'},
      {id: 'place.4', place_name: 'Place D', place_type: ['place'], properties: { mapbox_id: 'mapboxId4' }, _source: 'mapbox'},
      {id: 'place.5', place_name: 'Place E', place_type: ['place'], properties: { mapbox_id: 'mapboxId5' }, _source: 'mapbox'}
    ]
  };
  geocoder.inputString = "My String";
  var selectedFeature = {
    id: 'place.1',
    place_name: 'Peets Coffee, 123 Main Street, San Francisco, CA, 94122, United States',
    properties: { mapbox_id: 'mapboxId1' }
  }
  eventsManager.select(selectedFeature, geocoder);
  expect(pushMethod.called).toBeTruthy();
  expect(sendMethod.called).toBeFalsy();
  var calledWithArgs = pushMethod.args[0][0];
  expect(calledWithArgs.event).toEqual('search.select');
  expect(calledWithArgs.version).toEqual('2.2');
  expect(calledWithArgs.resultId).toEqual('place.1');
  expect(calledWithArgs.resultPlaceName).toEqual('Peets Coffee, 123 Main Street, San Francisco, CA, 94122, United States');
  expect(calledWithArgs.resultIndex).toEqual(0);
  expect(calledWithArgs.queryString).toEqual('My String');
  expect(calledWithArgs.path).toEqual('geocoding/v5/mapbox.places');
  expect(calledWithArgs.suggestionIds).toEqual(['mapboxId1', 'mapboxId2', 'mapboxId3', 'mapboxId4', 'mapboxId5']);
  expect(calledWithArgs.suggestionTypes).toEqual(['place', 'place', 'place', 'place', 'place']);
  expect(calledWithArgs.suggestionNames).toEqual(['Place A', 'Place B', 'Place C', 'Place D', 'Place E']);
  expect(calledWithArgs.suggestionSources).toEqual(['mapbox', 'mapbox', 'mapbox', 'mapbox', 'mapbox']);
  expect(calledWithArgs.resultMapboxId).toEqual('mapboxId1');
  sendMethod.restore();
  pushMethod.restore();
  requestMethod.restore();
});

test('generate session id', function(){
  var eventsManager = new MapboxEventsManager({
    accessToken: 'abc123'
  })
  expect(eventsManager.getSessionId()).toEqual(eventsManager.pluginSessionID + '.0');
  eventsManager.sessionIncrementer++;
  expect(eventsManager.getSessionId()).toEqual(eventsManager.pluginSessionID + '.1');
  expect(typeof eventsManager.generateSessionID()).toEqual('string');
  expect(eventsManager.generateSessionID()).not.toEqual(eventsManager.generateSessionID());
  expect(eventsManager.generateSessionID().length).toEqual(21);
});


test('get user agent', function(){
  var eventsManager = new MapboxEventsManager({
    accessToken: 'abc123'
  })
  expect(typeof eventsManager.getUserAgent()).toEqual('string');
  expect(eventsManager.getUserAgent().includes('mapbox-gl-geocoder.')).toBeTruthy();
});

test('get selected index', function(){
  var needle = {id: 'abc.123'};
  var haystack = [{id: 'abc.999'}, {id: 'abc.123'}, {id: 'abc.888'}, {id: 'abc.777'}, {id: 'abc.666'}];
  var eventsManager = new MapboxEventsManager({
    accessToken: 'abc123'
  })
  var geocoder = new MapboxGeocoder({accessToken: 'abc123'});
  geocoder._typeahead = {
    data: haystack
  };
  expect(typeof eventsManager.getSelectedIndex(needle, geocoder)).toEqual('number');
  expect(eventsManager.getSelectedIndex(needle, geocoder)).toEqual(1);
});

test('should enable logging', function(){
  var nonMapboxOptions = {
    accessToken: 'abc123',
    origin: 'https://my.server.endpoint'
  }
  var eventsManager = new MapboxEventsManager(nonMapboxOptions);
  expect(eventsManager.shouldEnableLogging(nonMapboxOptions)).toBeFalsy();
  var mapboxOptions = {
    accessToken: 'abc123',
    origin: 'https://api.mapbox.com'
  }
  var eventsManagerMapbox = new MapboxEventsManager(mapboxOptions);
  expect(eventsManagerMapbox.shouldEnableLogging(mapboxOptions)).toBeTruthy();

  mapboxOptions.filter = function(){return true};
  expect(eventsManagerMapbox.shouldEnableLogging(mapboxOptions)).toBeTruthy();

  mapboxOptions.filter = undefined;
  mapboxOptions.localGeocoder = function(){return 'abc'}
  expect(eventsManagerMapbox.shouldEnableLogging(mapboxOptions)).toBeTruthy();
});

test('should enable logging [opt-out]', function(){
  var optOutOptions = {
    accessToken: 'abc123',
    enableEventLogging: false
  }
  var eventsManager = new MapboxEventsManager(optOutOptions);
  expect(eventsManager.shouldEnableLogging(optOutOptions)).toBeFalsy();
});


test('should properly handle keypress events', function(){
  var testEvent = {key: 'S', code :'KeyS', metaKey: false, keyCode: 83, shiftKey: true};
  var eventsManager = new MapboxEventsManager({
    accessToken: 'abc123'
  })
  var sendMethod = sinon.spy(eventsManager, "send");
  var pushMethod =  sinon.spy(eventsManager, "push");
  var requestMethod = sinon.stub(eventsManager, "request").yields(null, {statusCode: 204});
  var geocoder = new MapboxGeocoder({accessToken: 'abc123'});
  geocoder.inputString = "My Input";
  eventsManager.keyevent(testEvent, geocoder);
  expect(requestMethod.notCalled).toBeTruthy();
  expect(sendMethod.notCalled).toBeTruthy();
  expect(pushMethod.calledOnce).toBeTruthy();
  var calledWithArgs = pushMethod.args[0][0];
  expect(calledWithArgs.event).toEqual('search.keystroke');
  expect(calledWithArgs.version).toEqual('2.2');
  expect(calledWithArgs.path).toEqual('geocoding/v5/mapbox.places');
  expect(calledWithArgs.lastAction).toEqual('S');
  expect(eventsManager.eventQueue.length).toEqual(1);
  sendMethod.restore();
  pushMethod.restore();
  requestMethod.restore();
});

test('does not send event when queryString empty', function(){
  var testEvent = {key: 'Backspace', code :'Backspace', metaKey: false, keyCode: 8, shiftKey: false};
  var eventsManager = new MapboxEventsManager({
    accessToken: 'abc123'
  })
  var sendMethod = sinon.spy(eventsManager, "send");
  var pushMethod =  sinon.spy(eventsManager, "push");
  var requestMethod = sinon.stub(eventsManager, "request").yields(null, {statusCode: 204});
  var geocoder = new MapboxGeocoder({accessToken: 'abc123'});
  geocoder.inputString = "";
  eventsManager.keyevent(testEvent, geocoder);
  expect(requestMethod.notCalled).toBeTruthy();
  expect(sendMethod.notCalled).toBeTruthy();
  expect(pushMethod.notCalled).toBeTruthy();
  expect(eventsManager.eventQueue.length).toEqual(0);
  sendMethod.restore();
  pushMethod.restore();
  requestMethod.restore();
});

test('it should properly flush events after the queue is full', function(){
  var eventsManager = new MapboxEventsManager({
    accessToken: 'abc123',
    maxQueueSize: 5
  });
  var requestMethod = sinon.stub(eventsManager, "request").yields(null, {statusCode: 204});
  var flushMethod = sinon.spy(eventsManager, "flush");
  for (var i =0; i < 10; i++){
    eventsManager.push({event: 'test.event'});
  }
  expect(flushMethod.calledTwice).toBeTruthy();
  expect(eventsManager.eventQueue.length).toEqual(0);

  requestMethod.restore();
  flushMethod.restore();
});

test('it should properly flush events if forced', function(){
  var eventsManager = new MapboxEventsManager({
    accessToken: 'abc123',
    maxQueueSize: 25
  });
  var requestMethod = sinon.stub(eventsManager, "request").yields(null, {statusCode: 204});
  var flushMethod = sinon.spy(eventsManager, "flush");
  for (var i =0; i < 10; i++){
    eventsManager.push({event: 'test.event'});
  }
  eventsManager.push({event: 'test.event'}, true);
  expect(flushMethod.calledOnce).toBeTruthy();
  expect(eventsManager.eventQueue.length).toEqual(0);

  requestMethod.restore();
  flushMethod.restore();
});

test('remove event manager', function(){
  var eventsManager = new MapboxEventsManager({
    accessToken: 'abc123'
  });
  var requestMethod = sinon.stub(eventsManager, "request").yields(null, {statusCode: 204});
  var flushMethod = sinon.spy(eventsManager, "flush");
  for (var i =0; i <= 10; i++){
    eventsManager.push({event: 'test.event'});
  }
  eventsManager.remove();
  expect(requestMethod.calledOnce).toBeTruthy();
  expect(flushMethod.calledOnce).toBeTruthy();
  expect(eventsManager.eventQueue.length).toEqual(0);

  flushMethod.restore();
  requestMethod.restore();
});

