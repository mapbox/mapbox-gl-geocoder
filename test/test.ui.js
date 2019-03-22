'use strict';

var once = require('lodash.once');
var MapboxGeocoder = require('../lib/index');
var mapboxgl = require('mapbox-gl');
var test = require('tape');
var sinon = require('sinon');

mapboxgl.accessToken = process.env.MapboxAccessToken;

test('Geocoder#inputControl', function(tt) {
  var container, map, geocoder;

  var changeEvent = document.createEvent('HTMLEvents');
  changeEvent.initEvent('change', true, false);

  var clickEvent = document.createEvent('HTMLEvents');
  clickEvent.initEvent('click', true, false);

  function setup(opts) {
    opts = opts || {};
    opts.accessToken = mapboxgl.accessToken;
    container = document.createElement('div');
    map = new mapboxgl.Map({ container: container });
    geocoder = new MapboxGeocoder(opts);
    map.addControl(geocoder);
  }

  tt.test('input', function(t) {
    setup({
      types: 'place'
    });
    var inputEl = container.querySelector('.mapboxgl-ctrl-geocoder input');
    var clearEl = container.querySelector('.mapboxgl-ctrl-geocoder button');

    t.plan(7);

    geocoder.on(
      'loading',
      once(function(e) {
        t.pass('load event was emitted');
        t.equals(e.query, '-79,43', 'loading event passes query parameter');
      })
    );

    geocoder.on(
      'result',
      once(function() {
        t.ok(inputEl.value, 'value populates in input');
        clearEl.dispatchEvent(clickEvent);
      })
    );

    geocoder.on(
      'clear',
      once(function() {
        t.pass('input was cleared');
        t.equals(geocoder.fresh, false, 'the geocoder is fresh again')

        geocoder.setInput('Paris');
        t.equals(inputEl.value, 'Paris', 'value populates in input');

        geocoder.setInput('90,45');
        t.equals(
          inputEl.value,
          '90,45',
          'valid LngLat value populates in input'
        );
        t.end();
      })
    );

    geocoder.query('-79,43');
  });

  tt.test('placeholder', function(t) {
    t.plan(1);
    setup({ placeholder: 'foo to the bar' });
    t.equal(
      map.getContainer().querySelector('.mapboxgl-ctrl-geocoder input')
        .placeholder,
      'foo to the bar',
      'placeholder is custom'
    );
    t.end();
  });

  tt.test('get language when a language is provided in the options', function(t){
    t.plan(1);
    setup({language: 'en-UK'});
    t.equals(geocoder.options.language, 'en-UK', 'uses the right language when set directly as an option');
  });

  tt.test('get language when a language obtained from the browser', function(t){
    t.plan(3);
    setup({});
    t.ok(geocoder.options.language, 'language is defined');
    t.ok(typeof(geocoder.options.language), 'string', 'language is defined  as a string');
    t.ok(geocoder.options.language.split("-").length, 2, 'language is defined as an iso tag with a subtag');
  })


  tt.test('placeholder language localization', function(t){
    t.plan(1);
    setup({language: 'de-DE'});
    t.equal(
      map.getContainer().querySelector('.mapboxgl-ctrl-geocoder input')
        .placeholder,
      'Suche',
      'placeholder is localized based on language'
    );
    t.end();
  });

  tt.test('placeholder language localization with more than one language specified', function(t){
    t.plan(1);
    setup({language: 'de-DE,lv'});
    t.equal(
      map.getContainer().querySelector('.mapboxgl-ctrl-geocoder input')
        .placeholder,
      'Suche',
      'placeholder is localized based on language'
    );
    t.end();
  })

  tt.test('_clear is not called on keydown (tab), no focus trap', function(t){
    t.plan(3);
    setup({});

    var inputEl = container.querySelector('.mapboxgl-ctrl-geocoder input');
    var focusSpy = sinon.spy(inputEl, 'focus');
    inputEl.focus();
    t.equal(focusSpy.called, true, 'input is focused');
    var keySpy = sinon.spy(geocoder,'_onKeyDown');
    var clearSpy = sinon.spy(geocoder, '_clear');
    geocoder._onKeyDown(new KeyboardEvent('keydown',{ code: 9, keyCode: 9 }));
    t.equal(keySpy.called, true, '_onKeyDown called');
    t.equal(clearSpy.called, false, '_clear should not be called');

    t.end();
  });

  tt.test('_clear is called on keydown (not tab)', function(t){
    t.plan(3);
    setup({});

    var inputEl = container.querySelector('.mapboxgl-ctrl-geocoder input');
    var focusSpy = sinon.spy(inputEl, 'focus');
    inputEl.focus();
    t.equal(focusSpy.called, true, 'input is focused');
    var keySpy = sinon.spy(geocoder,'_onKeyDown');
    var clearSpy = sinon.spy(geocoder, '_clear');
    geocoder._onKeyDown(new KeyboardEvent('keydown',{ code: 1, keyCode: 1 }));
    t.equal(keySpy.called, true, '_onKeyDown called');
    t.equal(clearSpy.called, true, '_clear should be called');

    t.end();
  });

  tt.test('options.collapsed=true', function(t) {
    t.plan(1);
    setup({
      collapsed: true
    });
    var wrapper = container.querySelector('.mapboxgl-ctrl-geocoder');
    t.equal(wrapper.classList.contains('geocoder-collapsed'), true, 'mapboxgl-ctrl-geocoder has `geocoder-collapsed` class');
    t.end();
  });

  tt.test('options.collapsed=true, focus', function(t) {
    t.plan(1);
    setup({
      collapsed: true
    });
    var wrapper = container.querySelector('.mapboxgl-ctrl-geocoder');
    var inputEl = container.querySelector('.mapboxgl-ctrl-geocoder input');
    // focus input, remove geocoder-collapsed
    var focusEvent = document.createEvent('Event');
    focusEvent.initEvent("focus", true, true);
    inputEl.dispatchEvent(focusEvent);
    t.equal(wrapper.classList.contains('geocoder-collapsed'), false, 'mapboxgl-ctrl-geocoder does not have `geocoder-collapsed` class when inputEl in focus');
    t.end();
  });

  tt.test('options.collapsed=true, hover', function(t) {
    t.plan(1);
    setup({
      collapsed: true
    });
    var wrapper = container.querySelector('.mapboxgl-ctrl-geocoder');
    // hover input, remove geocoder-collapsed
    var hoverEvent = document.createEvent('Event');
    hoverEvent.initEvent("mouseenter", true, true);
    wrapper.dispatchEvent(hoverEvent);
    t.equal(wrapper.classList.contains('geocoder-collapsed'), false, 'mapboxgl-ctrl-geocoder does not have `geocoder-collapsed` class when wrapper hovered');
    t.end();
  });

  tt.test('options.collapsed=false', function(t) {
    t.plan(1);
    setup({
      collapsed: false
    });
    var wrapper = container.querySelector('.mapboxgl-ctrl-geocoder');
    t.equal(wrapper.classList.contains('geocoder-collapsed'), false, 'mapboxgl-ctrl-geocoder does not have `geocoder-collapsed` class');
    t.end();
  });

  tt.test('createIcon', function(t) {
    t.plan(1);
    setup({ });
    var icon = geocoder.createIcon('search', '<path/>');
    t.equal(
      icon.outerHTML,
      '<svg class="geocoder-icon geocoder-icon-search" viewBox="0 0 18 18" xml:space="preserve" width="18" height="18"><path></path></svg>',
      'creates an svg given the class name and path'
    );
    t.end();
  });

  tt.end();
});
