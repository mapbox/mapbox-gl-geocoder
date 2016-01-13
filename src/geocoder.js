var MapboxClient = require('mapbox/lib/services/geocoder');
var Typeahead = require('suggestions');
var debounce = require('lodash.debounce');
var EventEmitter = require('events').EventEmitter;
var extend = require('xtend');

module.exports = Geocoder;

function Geocoder(options) {
  this._ev = new EventEmitter();
  this.options = extend({}, this.options, options);
}

Geocoder.prototype = mapboxgl.util.inherit(mapboxgl.Control, {
  options: {
    position: 'top-left',
    proximity: null
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
    icon.classList.add('geocoder-icon', 'geocoder-icon-search');

    var input = this._inputEl = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Search';

    input.addEventListener('keypress', debounce(function(e) {
      this._queryFromInput(e.target.value);
    }.bind(this)), 100);

    input.addEventListener('change', function() {
      var selected = this._typeahead.selected;

      if (selected) {

        if (selected.bbox) {
          var bbox = selected.bbox;
          map.fitBounds([[bbox[0], bbox[1]],[bbox[2], bbox[3]]]);
        } else {
          map.flyTo({ center: selected.center });
        }

        this._input = selected;
        this.fire('geocoder.input', { result: selected });
      }
    }.bind(this));

    var actions = document.createElement('div');
    actions.classList.add('geocoder-pin-right');

    var clear = this._clearEl = document.createElement('button');
    clear.classList.add('geocoder-icon', 'geocoder-icon-close');
    clear.addEventListener('click', this._clear.bind(this));

    var loading = this._loadingEl = document.createElement('span');
    loading.classList.add('geocoder-icon', 'geocoder-icon-loading');

    actions.appendChild(clear);
    actions.appendChild(loading);

    el.appendChild(icon);
    el.appendChild(input);
    el.appendChild(actions);

    this.container.appendChild(el);
    this.client = new MapboxClient(this.options.accessToken ?
                                   this.options.accessToken :
                                   mapboxgl.accessToken);

    // Override the control being added to control containers
    if (this.options.container) this.options.position = false;

    this._typeahead = new Typeahead(input, []);
    this._typeahead.getItemValue = function(item) { return item.place_name; };

    return el;
  },

  _geocode: function(q, callback) {
    this._loadingEl.classList.toggle('active', true);
    this.fire('geocoder.loading');

    var options = this.options.proximity ? {
      proximity: {
        longitude: this.options.proximity[0],
        latitude: this.options.proximity[1]
      }
    } : {};

    return this.client.geocodeForward(q.trim(), options, function(err, res) {
      this._loadingEl.classList.toggle('active', false);
      if (err) return this.fire('geocoder.error', { error: err.message });
      if (!res.features.length) this._typeahead.selected = null;
      this._typeahead.update(res.features);
      this._clearEl.classList.toggle('active', res.features.length);
      return callback(res.features);
    }.bind(this));
  },

  _queryFromInput: function(q) {
    this._geocode(q, function(results) {
      this._results = results;
    }.bind(this));
  },

  _query: function(input) {
    if (!input) return;
    var q = (typeof input === 'string') ? input : input.join();
    this._geocode(q, function(results) {
      if (!results.length) return;
      var result = results[0];
      this._results = results;
      this._typeahead.selected = result;

      // Trigger inputs onChange event
      var onChange = document.createEvent('HTMLEvents');
      onChange.initEvent('change', true, false);
      this._inputEl.value = result.place_name;
      this._inputEl.dispatchEvent(onChange);
    }.bind(this));
  },

  _clear: function() {
    this._input = null;
    this._inputEl.value = '';
    this._inputEl.focus();

    this._typeahead.selected = null;
    this._typeahead.update([]);
    this.fire('geocoder.clear');
  },

  /**
   * Return the input
   * @returns {Object} input
   */
  getResult: function() {
    return this._input;
  },

  /**
   * Set input
   * @param {Array|String} query An array of coordinates [lng, lat] or location name as a string.
   * @returns {Geocoder} this
   */
  query: function(query) {
    this._query(query);
    return this;
  },

  /**
   * Subscribe to events that happen within the plugin.
   * @param {String} type name of event. Available events and the data passed into their respective event objects are:
   * - __geocoder.clear__ `Emitted when the input is cleared`
   * - __geocoder.loading__ `Emitted when the geocoder is looking up a query`
   * - __geocoder.input__ `{ result } Fired when input is set`
   * - __geocoder.error__ `{ error } Error as string
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
