'use strict';

var Typeahead = require('suggestions');
var debounce = require('lodash.debounce');
var extend = require('xtend');
var EventEmitter = require('events').EventEmitter;
var exceptions = require('./exceptions');
var MapboxClient = require('mapbox/lib/services/geocoding');

/**
 * A geocoder component using Mapbox Geocoding API
 * @class MapboxGeocoder
 *
 * @param {Object} options
 * @param {String} [options.accessToken=null] Required unless `mapboxgl.accessToken` is set globally
 * @param {Number} [options.zoom=16] On geocoded result what zoom level should the map animate to.
 * @param {Boolean} [options.flyTo=true] If false, animating the map to a selected result is disabled.
 * @param {String} [options.placeholder="Search"] Override the default placeholder attribute value.
 * @example
 * var geocoder = new MapboxGeocoder();
 * map.addControl(geocoder);
 * @return {MapboxGeocoder} `this`
 */
function MapboxGeocoder(options) {
  this._eventEmitter = new EventEmitter();
  this.options = extend({}, this.options, options);
}

MapboxGeocoder.prototype = {

  options: {
    placeholder: 'Search',
    zoom: 16,
    flyTo: true
  },

  onAdd: function(map) {
    this._map = map;
    this.mapboxClient = new MapboxClient(this.options.accessToken);
    this._onChange = this._onChange.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onQueryResult = this._onQueryResult.bind(this);
    this._clear = this._clear.bind(this);

    var el = this.container = document.createElement('div');
    el.className = 'mapboxgl-ctrl-geocoder mapboxgl-ctrl';

    var icon = document.createElement('span');
    icon.className = 'geocoder-icon geocoder-icon-search';

    this._inputEl = document.createElement('input');
    this._inputEl.type = 'text';
    this._inputEl.placeholder = this.options.placeholder;

    this._inputEl.addEventListener('keydown', this._onKeyDown);
    this._inputEl.addEventListener('change', this._onChange);

    var actions = document.createElement('div');
    actions.classList.add('geocoder-pin-right');

    this._clearEl = document.createElement('button');
    this._clearEl.className = 'geocoder-icon geocoder-icon-close';
    this._clearEl.addEventListener('click', this._clear);

    this._loadingEl = document.createElement('span');
    this._loadingEl.className = 'geocoder-icon geocoder-icon-loading';

    actions.appendChild(this._clearEl);
    actions.appendChild(this._loadingEl);

    el.appendChild(icon);
    el.appendChild(this._inputEl);
    el.appendChild(actions);

    this._typeahead = new Typeahead(this._inputEl, [], { filter: false });
    this._typeahead.getItemValue = function(item) { return item.place_name; };

    return el;
  },

  onRemove: function() {
    this.container.parentNode.removeChild(this.container);
    this._map = null;
    return this;
  },

  _onKeyDown: debounce(function(e) {
    if (!e.target.value) {
      return this._clearEl.style.display = 'none';
    }

    // TAB, ESC, LEFT, RIGHT, ENTER, UP, DOWN
    if (e.metaKey || [9, 27, 37, 39, 13, 38, 40].indexOf(e.keyCode) !== -1) return;
    this._geocode(e.target.value);
  }, 200),

  _onChange: function() {
    if (this._inputEl.value) this._clearEl.style.display = 'block';
    var selected = this._typeahead.selected;
    if (selected) {
      if (this.options.flyTo) {
        if (!exceptions[selected.id] &&
            (selected.bbox && selected.context && selected.context.length <= 3 ||
            selected.bbox && !selected.context)) {
          var bbox = selected.bbox;
          this._map.fitBounds([[bbox[0], bbox[1]],[bbox[2], bbox[3]]]);
        } else if (exceptions[selected.id]) {
          // Certain geocoder search results return (and therefore zoom to fit)
          // an unexpectedly large bounding box: for example, both Russia and the
          // USA span both sides of -180/180, or France includes the island of
          // Reunion in the Indian Ocean. An incomplete list of these exceptions
          // at ./exceptions.json provides "reasonable" bounding boxes as a
          // short-term solution; this may be amended as necessary.
          this._map.fitBounds(exceptions[selected.id].bbox);
        } else {
          this._map.flyTo({
            center: selected.center,
            zoom: this.options.zoom
          });
        }
      }
      this._eventEmitter.emit('result', { result: selected });
    }
  },

  _geocode: function(searchInput) {
    this._loadingEl.style.display = 'block';
    this._eventEmitter.emit('loading');
    var request = this.mapboxClient.geocodeForward(searchInput, this.options);

    request.then(function (response) {
      this._loadingEl.style.display = 'none';
      var res = response.entity;
      if (res.features.length) {
        this._clearEl.style.display = 'block';
      } else {
        this._clearEl.style.display = 'none';
        this._typeahead.selected = null;
      }

      this._eventEmitter.emit('results', res);
      this._typeahead.update(res.features);
    }.bind(this));

    request.catch(function (err) {
      this._loadingEl.style.display = 'none';
      this._eventEmitter.emit('error', { error: err });
    }.bind(this));

    return request;
  },

  _clear: function() {
    this._inputEl.value = '';
    this._typeahead.selected = null;
    this._typeahead.clear();
    this._onChange();
    this._inputEl.focus();
    this._clearEl.style.display = 'none';
    this._eventEmitter.emit('clear');
  },

  _onQueryResult: function(response) {
    var results = response.entity;
    if (!results.features.length) return;
    var result = results.features[0];
    this._typeahead.selected = result;
    this._inputEl.value = result.place_name;
    this._onChange();
  },

  /**
   * Set & query the input
   * @param {string} searchInput location name or other search input
   * @returns {MapboxGeocoder} this
   */
  query: function(searchInput) {
    this._geocode(searchInput).then(this._onQueryResult);
    return this;
  },

  /**
   * Set input
   * @param {string} searchInput location name or other search input
   * @returns {MapboxGeocoder} this
   */
  setInput: function(searchInput) {
    // Set input value to passed value and clear everything else.
    this._inputEl.value = searchInput;
    this._typeahead.selected = null;
    this._typeahead.clear();
    this._onChange();
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
   * @returns {MapboxGeocoder} this;
   */
  on: function(type, fn) {
    this._eventEmitter.on(type, fn);
    return this;
  },

  /**
   * Remove an event
   * @returns {MapboxGeocoder} this
   * @param {String} type Event name.
   * @param {Function} fn Function that should unsubscribe to the event emitted.
   */
  off: function(type, fn) {
    this._eventEmitter.removeListener(type, fn);
    return this;
  }
};

module.exports = MapboxGeocoder;
