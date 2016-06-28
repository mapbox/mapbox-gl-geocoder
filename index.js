'use strict';

/* global mapboxgl */
if (!mapboxgl) throw new Error('include mapboxgl before mapbox-gl-geocoder.js');

var Typeahead = require('suggestions');
var debounce = require('lodash.debounce');
var extend = require('xtend');
require('es6-promise').polyfill();
var fetch = require('isomorphic-fetch');
var EventEmitter = require('events').EventEmitter;

// Mapbox Geocoder version
var API = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';

/**
 * A geocoder component using Mapbox Geocoding APi
 * @class mapboxgl.Geocoder
 *
 * @param {Object} options
 * @param {String} [options.position="top-right"] A string indicating the control's position on the map. Options are `top-right`, `top-left`, `bottom-right`, `bottom-left`
 * @param {String} [options.accessToken=null] Required unless `mapboxgl.accessToken` is set globally
 * @param {string|element} options.container html element to initialize the map in (or element id as string). if no container is passed map.getcontainer() is used instead.
 * @param {Array<Array<number>>} options.proximity If set, search results closer to these coordinates will be given higher priority.
 * @param {Number} [options.zoom=16] On geocoded result what zoom level should the map animate to.
 * @param {Boolean} [options.flyTo=true] If false, animating the map to a selected result is disabled.
 * @param {String} [options.placeholder="Search"] Override the default placeholder attribute value.
 * @param {string} options.types a comma seperated list of types that filter results to match those specified. See https://www.mapbox.com/developers/api/geocoding/#filter-type for available types.
 * @param {string} options.country a comma seperated list of country codes to limit results to specified country or countries.
 * @example
 * var geocoder = new mapboxgl.Geocoder();
 * map.addControl(geocoder);
 * @return {Geocoder} `this`
 */
function Geocoder(options) {
  this._ev = new EventEmitter();
  this.options = extend({}, this.options, options);
}

Geocoder.prototype = mapboxgl.util.inherit(mapboxgl.Control, {

  options: {
    position: 'top-left',
    placeholder: 'Search',
    zoom: 16,
    flyTo: true
  },

  onAdd: function(map) {
    this.container = this.options.container ?
      typeof this.options.container === 'string' ?
      document.getElementById(this.options.container) :
      this.options.container :
      map.getContainer();

    // Template
    var el = document.createElement('div');
    el.className = 'mapboxgl-ctrl-geocoder';

    var icon = document.createElement('span');
    icon.className = 'geocoder-icon geocoder-icon-search';

    var input = this._inputEl = document.createElement('input');
    input.type = 'text';
    input.placeholder = this.options.placeholder;

    input.addEventListener('keydown', debounce(function(e) {
      if (!e.target.value) return this._clearEl.classList.remove('active');

      // TAB, ESC, LEFT, RIGHT, ENTER, UP, DOWN
      if (e.metaKey || [9, 27, 37, 39, 13, 38, 40].indexOf(e.keyCode) !== -1) return;
      this._queryFromInput(e.target.value);
    }.bind(this)), 200);

    input.addEventListener('change', function(e) {
      if (e.target.value) this._clearEl.classList.add('active');

      var selected = this._typeahead.selected;
      if (selected) {
        if (this.options.flyTo) {
          if (selected.bbox && selected.context && selected.context.length <= 3 ||
              selected.bbox && !selected.context) {
            var bbox = selected.bbox;
            map.fitBounds([[bbox[0], bbox[1]],[bbox[2], bbox[3]]]);
          } else {
            map.flyTo({
              center: selected.center,
              zoom: this.options.zoom
            });
          }
        }
        this._input = selected;
        this.fire('result', { result: selected });
      }
    }.bind(this));

    var actions = document.createElement('div');
    actions.classList.add('geocoder-pin-right');

    var clear = this._clearEl = document.createElement('button');
    clear.className = 'geocoder-icon geocoder-icon-close';
    clear.addEventListener('click', this._clear.bind(this));

    var loading = this._loadingEl = document.createElement('span');
    loading.className = 'geocoder-icon geocoder-icon-loading';

    actions.appendChild(clear);
    actions.appendChild(loading);

    el.appendChild(icon);
    el.appendChild(input);
    el.appendChild(actions);

    this.container.appendChild(el);

    // Override the control being added to control containers
    if (this.options.container) this.options.position = false;

    this._typeahead = new Typeahead(input, [], { filter: false });
    this._typeahead.getItemValue = function(item) { return item.place_name; };

    return el;
  },

  _geocode: function(q, callback) {
    this._loadingEl.classList.add('active');
    this.fire('loading');

    var options = {};


    var token = this.options.accessToken ?
      this.options.accessToken :
      mapboxgl.accessToken;

    var url = API + encodeURIComponent(q.trim()) + '.json?access_token=' + token

    if (this.options.proximity){
      url = url + '&proximity=' + this.options.proximity.join();
    }
    if (this.options.country){
      url = url + '&country=' + this.options.country;
    }
    if (this.options.types){
      url = url + '&types=' + this.options.types;
    }

    //REVISIT: the original code used to cancel existing requests at
    //this point:
    //if (this.request) this.request.cancel();
    //Canceling a fetch is not currently possible, but is under discussion here:
    //https://github.com/whatwg/fetch/issues/27
    this.request = fetch(url)
    .then(function(response) {
      if (response.status >= 400) {
        this._loadingEl.classList.remove('active');
        return this.fire('error', { error: err.message });
      }
      return response.json();
    }.bind(this))
    .then(function(body) {
      this._loadingEl.classList.remove('active');
      if (body.features.length) {
        this._clearEl.classList.add('active');
      } else {
        this._clearEl.classList.remove('active');
        this._typeahead.selected = null;
      }
      this.fire('results', { results: body.features });
      this._typeahead.update(body.features);
      return callback(body.features);
    }.bind(this));
  },

  _queryFromInput: function(q) {
    q = q.trim();
    if (!q) this._clear();
    if (q.length > 2) {
      this._geocode(q, function(results) {
        this._results = results;
      }.bind(this));
    }
  },

  _change: function() {
    var onChange = document.createEvent('HTMLEvents');
    onChange.initEvent('change', true, false);
    this._inputEl.dispatchEvent(onChange);
  },

  _query: function(input) {
    if (!input) return;
    if (typeof input === 'object' && input.length) {
      input = [
        mapboxgl.util.wrap(input[0], -180, 180),
        mapboxgl.util.wrap(input[1], -180, 180)
      ].join();
    }

    this._geocode(input, function(results) {
      if (!results.length) return;
      var result = results[0];
      this._results = results;
      this._typeahead.selected = result;
      this._inputEl.value = result.place_name;
      this._change();
    }.bind(this));
  },

  _setInput: function(input) {
    if (!input) return;
    if (typeof input === 'object' && input.length) {
      input = [
        mapboxgl.util.wrap(input[0], -180, 180),
        mapboxgl.util.wrap(input[1], -180, 180)
      ].join();
    }

    // Set input value to passed value and clear everything else.
    this._inputEl.value = input;
    this._input = null;
    this._typeahead.selected = null;
    this._typeahead.clear();
    this._change();
  },

  _clear: function() {
    this._input = null;
    this._inputEl.value = '';
    this._typeahead.selected = null;
    this._typeahead.clear();
    this._change();
    this._inputEl.focus();
    this._clearEl.classList.remove('active');
    this.fire('clear');
  },

  /**
   * Return the input
   * @returns {Object} input
   */
  getResult: function() {
    return this._input;
  },

  /**
   * Set & query the input
   * @param {Array|String} query An array of coordinates [lng, lat] or location name as a string.
   * @returns {Geocoder} this
   */
  query: function(query) {
    this._query(query);
    return this;
  },

  /**
   * Set input
   * @param {Array|String} value An array of coordinates [lng, lat] or location name as a string. Calling this function just sets the input and does not trigger an API request.
   * @returns {Geocoder} this
   */
  setInput: function(value) {
    this._setInput(value);
    return this;
  },

  /**
   * Subscribe to events that happen within the plugin.
   * @param {String} type name of event. Available events and the data passed into their respective event objects are:
   *
   * - __clear__ `Emitted when the input is cleared`
   * - __loading__ `Emitted when the geocoder is looking up a query`
   * - __results__ `{ results } Fired when the geocoder returns a response`
   * - __result__ `{ result } Fired when input is set`
   * - __error__ `{ error } Error as string
   * @param {Function} fn function that's called when the event is emitted.
   * @returns {Geocoder} this;
   */
  on: function(type, fn) {
    this._ev.on(type, fn);
    return this;
  },

  /**
   * Fire an event
   * @param {String} type event name.
   * @param {Object} data event data to pass to the function subscribed.
   * @returns {Geocoder} this
   */
  fire: function(type, data) {
    this._ev.emit(type, data);
    return this;
  },

  /**
   * Remove an event
   * @returns {Geocoder} this
   * @param {String} type Event name.
   * @param {Function} fn Function that should unsubscribe to the event emitted.
   */
  off: function(type, fn) {
    this._ev.removeListener(type, fn);
    return this;
  }
});

if (window.mapboxgl) {
  mapboxgl.Geocoder = Geocoder;
} else if (typeof module !== 'undefined') {
  module.exports = Geocoder;
}
