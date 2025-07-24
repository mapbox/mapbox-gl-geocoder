import {describe, test, afterEach} from 'vitest';
import once from 'lodash.once';
import mapboxgl from 'mapbox-gl';
import sinon from 'sinon';

import MapboxGeocoder from '../lib/index';

mapboxgl.accessToken = import.meta.env.MapboxAccessToken;

describe('Geocoder#inputControl', function() {
  var container, map, geocoder;

  var changeEvent = document.createEvent('HTMLEvents');
  changeEvent.initEvent('change', true, false);

  var clickEvent = document.createEvent('HTMLEvents');
  clickEvent.initEvent('click', true, false);

  afterEach(function() {
    if (container) {
      container.remove();
    }
    if (map) {
      map.remove();
    }
  });

  function setup(opts) {
    opts = opts || {};
    opts.accessToken = mapboxgl.accessToken;
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

  test('input', async function({expect}) {
    setup({
      types: 'place',
      mapboxgl: mapboxgl
    });
    var inputEl = container.querySelector('.mapboxgl-ctrl-geocoder input');
    var clearEl = container.querySelector('.mapboxgl-ctrl-geocoder button');

    expect.assertions(7);

    geocoder.on(
      'loading',
      once(function(e) {
        // loading event passes query parameter
        expect(e.query).toEqual('-79,43');
      })
    );

    geocoder.on(
      'result',
      once(function() {
        // value populates in input
        expect(inputEl.value).toBeTruthy();
        // a marker is created to show the selection
        expect(geocoder.mapMarker).toBeTruthy()
        clearEl.dispatchEvent(clickEvent);
      })
    );

    const wait = new Promise((resolve) => {
      geocoder.on(
        'clear',
        once(function() {
          setTimeout(function () {
            // the geocoder is fresh again
            expect(geocoder.fresh).toEqual(false)
            // the marker was reset on clear
            expect(geocoder.mapMarker).toEqual(null)

            geocoder.setInput('Paris');
            // value populates in input
            expect(inputEl.value).toEqual('Paris');

            geocoder.setInput('90,45');
            // valid LngLat value populates in input
            expect(inputEl.value).toEqual('90,45');
            resolve();
          });
        })
      );
    });

    geocoder.query('-79,43');

    await wait;
  });

  test('placeholder', function({expect}) {
    expect.assertions(1);
    setup({ placeholder: 'foo to the bar' });
    // placeholder is custom
    expect(map.getContainer().querySelector('.mapboxgl-ctrl-geocoder input')
      .placeholder).toEqual('foo to the bar');

  });

  test('get language when a language is provided in the options', function({expect}){
    expect.assertions(1);
    setup({language: 'en-UK'});
    // uses the right language when set directly as an option
    expect(geocoder.options.language).toEqual('en-UK');
  });

  test('get language when a language obtained from the browser', function({expect}){
    expect.assertions(3);
    setup({});
    // language is defined
    expect(geocoder.options.language).toBeTruthy();
    // string
    expect(typeof(geocoder.options.language)).toBeTruthy();
    // 2
    expect(geocoder.options.language.split("-").length).toBeTruthy();
  })


  test('placeholder language localization', function({expect}){
    expect.assertions(1);
    setup({language: 'de-DE'});
    // placeholder is localized based on language
    expect(map.getContainer().querySelector('.mapboxgl-ctrl-geocoder input')
      .placeholder).toEqual('Suche');

  });

  test('placeholder language localization with more than one language specified', function({expect}){
    expect.assertions(1);
    setup({language: 'de-DE,lv'});
    // placeholder is localized based on language
    expect(map.getContainer().querySelector('.mapboxgl-ctrl-geocoder input')
      .placeholder).toEqual('Suche');

  });

  test('clear is not called on keydown (tab), no focus trap', function({expect}){
    expect.assertions(3);
    setup({});

    var inputEl = container.querySelector('.mapboxgl-ctrl-geocoder input');
    var focusSpy = sinon.spy(inputEl, 'focus');
    inputEl.focus();
    // input is focused
    expect(focusSpy.called).toEqual(true);
    var keySpy = sinon.spy(geocoder,'_onKeyDown');
    var clearSpy = sinon.spy(geocoder, 'clear');
    geocoder._onKeyDown(new KeyboardEvent('keydown',{ code: 9, keyCode: 9 }));
    // _onKeyDown called
    expect(keySpy.called).toEqual(true);
    // clear should not be called
    expect(clearSpy.called).toEqual(false);


  });

  test('clear is called on keydown (not tab)', function({expect}){
    expect.assertions(3);
    setup({});

    var inputEl = container.querySelector('.mapboxgl-ctrl-geocoder input');
    var focusSpy = sinon.spy(inputEl, 'focus');
    inputEl.focus();
    // input is focused
    expect(focusSpy.called).toEqual(true);
    var keySpy = sinon.spy(geocoder,'_onKeyDown');
    var clearSpy = sinon.spy(geocoder, 'clear');
    geocoder._onKeyDown(new KeyboardEvent('keydown',{ code: 1, keyCode: 1 }));
    // _onKeyDown called
    expect(keySpy.called).toEqual(true);
    // clear should be called
    expect(clearSpy.called).toEqual(true);


  });

  test('options.clearAndBlurOnEsc=true clears and blurs on escape', function({expect}) {
    expect.assertions(4);
    setup({
      clearAndBlurOnEsc: true
    });
    var inputEl = container.querySelector('.mapboxgl-ctrl-geocoder input');
    var focusSpy = sinon.spy(inputEl, 'focus');
    var blurSpy = sinon.spy(inputEl, 'blur');

    inputEl.focus();
    // input is focused
    expect(focusSpy.called).toEqual(true);

    geocoder.setInput('testval');
    expect(inputEl.value).toEqual('testval');

    geocoder._onKeyDown(new KeyboardEvent('keydown',{ code: 1, keyCode: 27 }));

    // value is cleared
    expect(inputEl.value).toEqual('');
    // input is blurred
    expect(blurSpy.called).toEqual(true);


  });

  test('options.clearAndBlurOnEsc=false does not clear and blur on escape', function({expect}) {
    expect.assertions(2);
    setup({
      clearAndBlurOnEsc: false
    });
    var inputEl = container.querySelector('.mapboxgl-ctrl-geocoder input');
    var focusSpy = sinon.spy(inputEl, 'focus');
    var blurSpy = sinon.spy(inputEl, 'blur');

    inputEl.focus();
    // input is focused
    expect(focusSpy.called).toEqual(true);

    geocoder._onKeyDown(new KeyboardEvent('keydown',{ code: 1, keyCode: 27 }));

    // input is still focused
    expect(blurSpy.called).toEqual(false);


  });

  test('options.collapsed=true', function({expect}) {
    expect.assertions(1);
    setup({
      collapsed: true
    });
    var wrapper = container.querySelector('.mapboxgl-ctrl-geocoder');
    // mapboxgl-ctrl-geocoder has `mapboxgl-ctrl-geocoder--collapsed` class
    expect(wrapper.classList.contains('mapboxgl-ctrl-geocoder--collapsed')).toEqual(true);
  });

  test('options.collapsed=true, focus', function({expect}) {
    expect.assertions(1);
    setup({
      collapsed: true
    });
    var wrapper = container.querySelector('.mapboxgl-ctrl-geocoder');
    var inputEl = container.querySelector('.mapboxgl-ctrl-geocoder input');
    // focus input, remove mapboxgl-ctrl-geocoder--collapsed
    var focusEvent = document.createEvent('Event');
    focusEvent.initEvent("focus", true, true);
    inputEl.dispatchEvent(focusEvent);
    // mapboxgl-ctrl-geocoder does not have `mapboxgl-ctrl-geocoder--collapsed` class when inputEl in focus
    expect(wrapper.classList.contains('mapboxgl-ctrl-geocoder--collapsed')).toEqual(false);

  });


  // This test is imperfect, because I cannot get smokestack to call the blur
  // listener no matter what I do. As a workaround, I'm:
  // 1. Testing that the option was set correctly.
  // 2. directly calling _clearOnBlur and asserting that it behaves as expected.
  test('options.clearOnBlur=true', function({expect}) {
    expect.assertions(5);
    setup({
      clearOnBlur: true
    });
    expect(geocoder.options.clearOnBlur).toEqual(true);

    var inputEl = container.querySelector('.mapboxgl-ctrl-geocoder input');
    var focusSpy = sinon.spy(inputEl, 'focus');

    geocoder.setInput('testval');
    expect(inputEl.value).toEqual('testval');

    inputEl.focus();

    // Call _clearOnBlur(), without a relatedTarget;
    geocoder._clearOnBlur({
      relatedTarget: null,
      preventDefault: function() {
        return null;
      }
    });

    // not yet cleared
    expect(inputEl.value).toEqual('testval');

    // Directly call _clearOnBlur(), with a relatedTarget;
    geocoder._clearOnBlur({
      relatedTarget: document.body,
      preventDefault: function() {
        return null;
      }
    });

    expect(focusSpy.calledOnce).toEqual(true), 'called once, focus should not get re-set on input';
    // cleared
    expect(inputEl.value).toEqual('');


  });

  test('options.clearOnBlur=false by default', function({expect}) {
    expect.assertions(1);
    setup();
    expect(geocoder.options.clearOnBlur).toEqual(false);

  });

  test('options.collapsed=true, hover', function({expect}) {
    expect.assertions(1);
    setup({
      collapsed: true
    });
    var wrapper = container.querySelector('.mapboxgl-ctrl-geocoder');
    // hover input, remove mapboxgl-ctrl-geocoder--collapsed
    var hoverEvent = document.createEvent('Event');
    hoverEvent.initEvent("mouseenter", true, true);
    wrapper.dispatchEvent(hoverEvent);
    // mapboxgl-ctrl-geocoder does not have `mapboxgl-ctrl-geocoder--collapsed` class when wrapper hovered
    expect(wrapper.classList.contains('mapboxgl-ctrl-geocoder--collapsed')).toEqual(false);

  });

  test('options.collapsed=false', function({expect}) {
    expect.assertions(1);
    setup({
      collapsed: false
    });
    var wrapper = container.querySelector('.mapboxgl-ctrl-geocoder');
    // mapboxgl-ctrl-geocoder does not have `mapboxgl-ctrl-geocoder--collapsed` class
    expect(wrapper.classList.contains('mapboxgl-ctrl-geocoder--collapsed')).toEqual(false);

  });

  test('createIcon', function({expect}) {
    expect.assertions(1);
    setup({ });
    var icon = geocoder.createIcon('search', '<path/>');
    // creates an svg given the class name and path
    expect(icon.outerHTML).toEqual(
      '<svg class="mapboxgl-ctrl-geocoder--icon mapboxgl-ctrl-geocoder--icon-search" viewBox="0 0 18 18" xml:space="preserve" width="18" height="18"><path></path></svg>'
    );

  });

  test('clear method can be overwritten', function({expect}) {
    expect.assertions(1);
    setup({ });
    geocoder.clear = sinon.spy();

    geocoder.clear();
    // the custom clear method was called
    expect(geocoder.clear.called).toBeTruthy();
  });


  test('event deduplication', async function({expect}) {
    setup({
      types: 'place',
      mapboxgl: mapboxgl
    });
    var clearEl = container.querySelector('.mapboxgl-ctrl-geocoder button');

    let checkVal = null;
    let resultCount = 0;

    const wait = new Promise((resolve) => {
      geocoder.on(
        'result',
        function() {
          // last selected is a string
          expect(typeof geocoder.lastSelected).toEqual('string');
          // last selected has been updated
          expect(geocoder.lastSelected).not.toEqual(checkVal);
          checkVal = geocoder.lastSelected
          clearEl.dispatchEvent(clickEvent);
          if (++resultCount === 2) {
            // resolve the promise after two results
            resolve();
          }
        }
      );
    });
    geocoder.query('test');
    geocoder.query('usa');

    await wait;
  });

  test('event deduplication even when IDs are shared', async function() {
    setup({
      types: 'place',
      mapboxgl: mapboxgl
    });
    var clearEl = container.querySelector('.mapboxgl-ctrl-geocoder button');

    let lastID = "test.abc123"
    let resultCount = 0;

    const wait = new Promise((resolve) => {
      geocoder.on(
        'result',
        function() {
          var selected = JSON.parse(geocoder.lastSelected);
          selected.id = lastID
          clearEl.dispatchEvent(clickEvent);
          if (++resultCount === 2) {
            resolve();
          }
        }
      );
    });

    geocoder.query('test');
    geocoder.query('usa');

    await wait;
  });

  test('paste event', async function() {
    setup({ });
    const clipboardData = new DataTransfer();
    clipboardData.setData('text/plain', 'Golden Gate Bridge');
    var pasteEvent = new ClipboardEvent('paste', {
      clipboardData
    })

    const wait = new Promise(resolve => geocoder.on(
      'results',
      once(resolve)
    ));

    var inputEl = container.querySelector('.mapboxgl-ctrl-geocoder input');
    inputEl.dispatchEvent(pasteEvent)

    await wait;
  });

  test('focus switches to the first item with useBrowserFocus', async ({expect})=>{
    setup({
      useBrowserFocus: true
    });

    document.body.appendChild(container);

    var inputEl = container.querySelector('.mapboxgl-ctrl-geocoder input');
    inputEl.value = 'Golden Gate Bridge';

    // dispatch space key to trigger typeahead
    inputEl.dispatchEvent(new KeyboardEvent('keydown', {
      key: ' ',
      keyCode: 32,
      which: 32,
      bubbles: true,
      cancelable: true
    }));

    sinon.spy(map, 'flyTo')
    
    const updateList = geocoder._typeahead.update.bind(geocoder._typeahead);

    const wait = new Promise((resolve, reject) => {
      geocoder._typeahead.update = function(data) {
        updateList(data);
        container.querySelector('.suggestions li').addEventListener('focus', function() {
          try {
            // map.flyTo was not called
            expect(!map.flyTo.called).toBeTruthy();
            resolve();
          } catch (err) {
            reject(err);
          }
        });
        setTimeout(() => {
          inputEl.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'ArrowDown',
            keyCode: 40,
            which: 40,
            bubbles: true,
            cancelable: true
          }));
        });
      }
    });

    await wait;
  });
});

describe('Geocoder#addTo(String) -- no map', function() {
  var container, geocoder;

  var changeEvent = document.createEvent('HTMLEvents');
  changeEvent.initEvent('change', true, false);

  var clickEvent = document.createEvent('HTMLEvents');
  clickEvent.initEvent('click', true, false);

  function setup(opts) {
    opts = opts || {};
    opts.accessToken = mapboxgl.accessToken;
    opts.enableEventLogging = false;
    container = document.createElement('div');
    container.className = "notAMap"
    document.body.appendChild(container)
    geocoder = new MapboxGeocoder(opts);
    geocoder.addTo(".notAMap")
  }

  afterEach(() => {
    if (container) {
      container.remove();
    }
  });

  test('result was added to container', ({expect})=>{
    setup();
    const geocoderRef = document.getElementsByClassName("mapboxgl-ctrl-geocoder");
    // A geocoder exists in the document
    expect(Object.keys(geocoderRef).length).toBeTruthy();
    const containerChildRef = container.getElementsByClassName("mapboxgl-ctrl-geocoder");
    // A geocoder exists as a child to the specified element
    expect(Object.keys(containerChildRef).length).toBeTruthy();
  });

  test('input works without a map', async function({expect}) {
    setup({
      types: 'place'
    });
    var inputEl = container.querySelector('.mapboxgl-ctrl-geocoder input');
    var clearEl = container.querySelector('.mapboxgl-ctrl-geocoder button');

    expect.assertions(5);

    geocoder.on(
      'loading',
      once(function(e) {
        // loading event passes query parameter
        expect(e.query).toEqual('-79,43');
      })
    );

    geocoder.on(
      'result',
      once(function() {
        // value populates in input
        expect(inputEl.value).toBeTruthy();
        clearEl.dispatchEvent(clickEvent);
      })
    );

    const wait = new Promise(resolve => {
        geocoder.on(
        'clear',
        once(function() {
          setTimeout(function() {
            // the geocoder is fresh again
            expect(geocoder.fresh).toEqual(false)

            geocoder.setInput('Paris');
            // value populates in input
            expect(inputEl.value).toEqual('Paris');

            geocoder.setInput('90,45');
            // valid LngLat value populates in input
            expect(inputEl.value).toEqual('90,45');

            resolve();
          });
        })
      );
    });

    geocoder.query('-79,43');

    await wait;
  });

  test('should add geolocate icon when browser supports geolocation', async ({expect})=>{
    expect.assertions(1);

    const opts = { enableGeolocation: true };
    opts.accessToken = mapboxgl.accessToken;
    opts.enableEventLogging = false;
    container = document.createElement('div');
    container.className = "notAMap"
    document.body.appendChild(container)
    const geocoder = new MapboxGeocoder(opts);

    const geolocation = geocoder.geolocation;

    sinon.stub(geolocation, 'isSupport').returns(true);

    geocoder.addTo(".notAMap")

    await new Promise(resolve => {
      setTimeout(() => {
        const geolocateEl = container.querySelector('.mapboxgl-ctrl-geocoder--icon-geolocate');

        // geolocate icon was shown
        expect(geolocateEl !== null).toBeTruthy();
        resolve();
      }, 100);
    });
  });

  test('should hide geolocate icon when browser doesn\'t support geolocation', async ({expect})=>{
    expect.assertions(1);

    const opts = { enableGeolocation: true };
    opts.accessToken = mapboxgl.accessToken;
    opts.enableEventLogging = false;
    container = document.createElement('div');
    container.className = "notAMap"
    document.body.appendChild(container)
    const geocoder = new MapboxGeocoder(opts);

    const geolocation = geocoder.geolocation;

    sinon.stub(geolocation, 'isSupport').returns(false);
    
    geocoder.addTo(".notAMap")

    await new Promise(resolve => {
      setTimeout(() => {
        const geolocateEl = container.querySelector('.mapboxgl-ctrl-geocoder--icon-geolocate');

        // geolocate icon was shown
        expect(geolocateEl === null).toBeTruthy();
        resolve();
      }, 100);
    });
  });
});


describe('Geocoder#addTo(HTMLElement) -- no map', function() {
  var container, geocoder;

  var changeEvent = document.createEvent('HTMLEvents');
  changeEvent.initEvent('change', true, false);

  var clickEvent = document.createEvent('HTMLEvents');
  clickEvent.initEvent('click', true, false);

  function setup(opts) {
    opts = opts || {};
    opts.accessToken = mapboxgl.accessToken;
    opts.enableEventLogging = false;
    container = document.createElement('div');
    container.className = "notAMap"
    document.body.appendChild(container)
    geocoder = new MapboxGeocoder(opts);
    geocoder.addTo(".notAMap")
  }

  afterEach(() => {
    if (container) {
      container.remove();
    }
  });

  test('result was added to container', ({expect})=>{
    setup();
    const geocoderRef = document.getElementsByClassName("mapboxgl-ctrl-geocoder");
    // A geocoder exists in the document
    expect(Object.keys(geocoderRef).length).toBeTruthy();
    const containerChildRef = container.getElementsByClassName("mapboxgl-ctrl-geocoder");
    // A geocoder exists as a child to the specified element
    expect(Object.keys(containerChildRef).length).toBeTruthy();
  });
});

describe('Geocoder#addTo(mapboxgl.Map)', function() {
  var container, geocoder;

  afterEach(() => {
    if (container) {
      container.remove();
    }
  });

  test('add to an existing map', ({expect})=>{
    const opts = {}
    opts.accessToken = mapboxgl.accessToken;
    opts.enableEventLogging = false;
    container = document.createElement('div');
    var map = new mapboxgl.Map({ container: container });
    geocoder = new MapboxGeocoder(opts);
    geocoder.addTo(map);
    // geocoder exists when added to the map
    expect(
      Object.keys(container.getElementsByClassName("mapboxgl-ctrl-geocoder--input")).length
    ).toBeTruthy()

  });

  test('add to an existing html class', ({expect})=>{
    const opts = {}
    opts.accessToken = mapboxgl.accessToken;
    opts.enableEventLogging = false;
    container = document.createElement('div');
    container.className = "notAMap"
    document.body.appendChild(container)
    geocoder = new MapboxGeocoder(opts);
    geocoder.addTo(".notAMap");
    // geocoder exists when added to an html element
    expect(
      Object.keys(container.getElementsByClassName("mapboxgl-ctrl-geocoder--input")).length
    ).toBeTruthy()

  });

  test('add to an existing HTMLElement', ({expect})=>{
    const opts = {}
    opts.accessToken = mapboxgl.accessToken;
    opts.enableEventLogging = false;
    container = document.createElement('div');
    document.body.appendChild(container)
    geocoder = new MapboxGeocoder(opts);
    geocoder.addTo(container);
    // geocoder exists when added to an html element
    expect(
      Object.keys(container.getElementsByClassName("mapboxgl-ctrl-geocoder--input")).length
    ).toBeTruthy()

  });

  test('throws if the element cannot be found', ({expect})=>{
    const opts = {}
    opts.accessToken = mapboxgl.accessToken;
    opts.enableEventLogging = false;
    container = document.createElement('div');
    container.className = "notAMap"
    // we haven't added this container to the dom, we've only created it
    geocoder = new MapboxGeocoder(opts);
    // addTo throws if the element is not found on the DOM
    expect(()=>{geocoder.addTo(container)}).toThrowError();
  });

  test('throws if there are multiple matching elements', ({expect})=>{
    const opts = {}
    opts.accessToken = mapboxgl.accessToken;
    opts.enableEventLogging = false;
    const container1 = document.createElement('div');
    container1.className = "notAMap"
    const container2 = document.createElement('div');
    container2.className = "notAMap"
    document.body.appendChild(container1)
    document.body.appendChild(container2)
    geocoder = new MapboxGeocoder(opts);
    // addTo throws if there are too many matching elements
    expect(()=>{geocoder.addTo(".notAMap")}).toThrowError();
    container1.remove();
    container2.remove();
  });
});
