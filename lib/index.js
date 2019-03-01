'use strict';

var Typeahead = require('suggestions');
var debounce = require('lodash.debounce');
var extend = require('xtend');
var EventEmitter = require('events').EventEmitter;
var exceptions = require('./exceptions');
var MapboxClient = require('@mapbox/mapbox-sdk');
var mbxGeocoder = require('@mapbox/mapbox-sdk/services/geocoding');
var MapboxEventManager = require('./events');
var geocoderService;

/**
 * A geocoder component using Mapbox Geocoding API
 * @class MapboxGeocoder
 * @param {Object} options
 * @param {String} options.accessToken Required.
 * @param {String} options.origin Use to set a custom API origin. Defaults to https://api.mapbox.com.
 * @param {Number} [options.zoom=16] On geocoded result what zoom level should the map animate to when a `bbox` isn't found in the response. If a `bbox` is found the map will fit to the `bbox`.
 * @param {Boolean} [options.flyTo=true] If false, animating the map to a selected result is disabled.
 * @param {String} [options.placeholder="Search"] Override the default placeholder attribute value.
 * @param {Object} [options.proximity] a proximity argument: this is
 * a geographical point given as an object with latitude and longitude
 * properties. Search results closer to this point will be given
 * higher priority.
 * @param {Boolean} [options.trackProximity=false] If true, the geocoder proximity will automatically update based on the map view.
 * @param {Array} [options.bbox] a bounding box argument: this is
 * a bounding box given as an array in the format [minX, minY, maxX, maxY].
 * Search results will be limited to the bounding box.
 * @param {string} [options.countries] a comma separated list of country codes to
 * limit results to specified country or countries.
 * @param {string} [options.types] a comma seperated list of types that filter
 * results to match those specified. See https://docs.mapbox.com/api/search/#data-types
 * for available types.
 * If reverseGeocode is enabled, you should specify one type. If you configure more than one type, the first type will be used.
 * @param {Number} [options.minLength=2] Minimum number of characters to enter before results are shown.
 * @param {Number} [options.limit=5] Maximum number of results to show.
 * @param {string} [options.language] Specify the language to use for response text and query result weighting. Options are IETF language tags comprised of a mandatory ISO 639-1 language code and optionally one or more IETF subtags for country or script. More than one value can also be specified, separated by commas.
 * @param {Function} [options.filter] A function which accepts a Feature in the [Carmen GeoJSON](https://github.com/mapbox/carmen/blob/master/carmen-geojson.md) format to filter out results from the Geocoding API response before they are included in the suggestions list. Return `true` to keep the item, `false` otherwise.
 * @param {Function} [options.localGeocoder] A function accepting the query string which performs local geocoding to supplement results from the Mapbox Geocoding API. Expected to return an Array of GeoJSON Features in the [Carmen GeoJSON](https://github.com/mapbox/carmen/blob/master/carmen-geojson.md) format.
 * @param {'distance'|'score'} [options.reverseMode='distance'] - Set the factors that are used to sort nearby results.
 * @param {boolean} [options.reverseGeocode] Enable reverse geocoding. Defaults to false. Expects coordinates to be lat, lon.
 * @example
 * var geocoder = new MapboxGeocoder({ accessToken: mapboxgl.accessToken });
 * map.addControl(geocoder);
 * @return {MapboxGeocoder} `this`
 *
 */

function MapboxGeocoder(options) {
  this._eventEmitter = new EventEmitter();
  this.options = extend({}, this.options, options);
  this.inputString = '';
  this.fresh = true;
}

MapboxGeocoder.prototype = {
  options: {
    placeholder: 'Search',
    zoom: 16,
    flyTo: true,
    trackProximity: false,
    minLength: 2,
    reverseGeocode: false,
    limit: 5,
    origin: 'https://api.mapbox.com'
  },

  onAdd: function(map) {
    this._map = map;

    geocoderService = mbxGeocoder(
      MapboxClient({
        accessToken: this.options.accessToken,
        origin: this.options.origin
      })
    );

    this.eventManager = new MapboxEventManager(this.options);

    this._onChange = this._onChange.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onQueryResult = this._onQueryResult.bind(this);
    this._clear = this._clear.bind(this);
    this._updateProximity = this._updateProximity.bind(this);

    var el = (this.container = document.createElement('div'));
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
    this._clearEl.setAttribute('aria-label', 'Clear');
    this._clearEl.addEventListener('click', this._clear);

    this._loadingEl = document.createElement('span');
    this._loadingEl.className = 'geocoder-icon geocoder-icon-loading';

    actions.appendChild(this._clearEl);
    actions.appendChild(this._loadingEl);

    el.appendChild(icon);
    el.appendChild(this._inputEl);
    el.appendChild(actions);

    this._typeahead = new Typeahead(this._inputEl, [], {
      filter: false,
      minLength: this.options.minLength,
      limit: this.options.limit
    });
    this._typeahead.getItemValue = function(item) {
      return item.place_name;
    };

    if (this.options.trackProximity) {
      this._updateProximity();
      this._map.on('moveend', this._updateProximity);
    }

    return el;
  },

  onRemove: function() {
    this.container.parentNode.removeChild(this.container);

    if (this.options.trackProximity) {
      this._map.off('moveend', this._updateProximity);
    }

    this._map = null;

    return this;
  },

  _onKeyDown: debounce(function(e) {
    
    // if target has shadowRoot, then get the actual active element inside the shadowRoot
    var target = e.target.shadowRoot
      ? e.target.shadowRoot.activeElement
      : e.target;
    if (!target.value) {
      this.fresh = true;
      // the user has removed all the text
      this._clear(e);
      return (this._clearEl.style.display = 'none');
    }

    // TAB, ESC, LEFT, RIGHT, ENTER, UP, DOWN
    if (e.metaKey || [9, 27, 37, 39, 13, 38, 40].indexOf(e.keyCode) !== -1)
      return;

    if (target.value.length >= this.options.minLength) {
      this._geocode(target.value);
    }
  }, 200),

  _onChange: function() {
    if (this._inputEl.value) this._clearEl.style.display = 'block';
    var selected = this._typeahead.selected;
    if (selected) {
      if (this.options.flyTo) {
        if (!exceptions[selected.id] && selected.bbox) {
          var bbox = selected.bbox;
          this._map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]]);
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
      this.eventManager.select(selected, this);
    }
  },

  _geocode: function(searchInput) {
    this._loadingEl.style.display = 'block';
    this._eventEmitter.emit('loading', { query: searchInput });
    this.inputString = searchInput;
    // Possible config proprerties to pass to client
    var keys = [
      'bbox',
      'limit',
      'proximity',
      'countries',
      'types',
      'language',
      'reverseMode'
    ];
    var self = this;
    // Create config object
    var config = keys.reduce(function(config, key) {
      if (self.options[key]) {
        // countries, types, and language need to be passed in as arrays to client
        // https://github.com/mapbox/mapbox-sdk-js/blob/master/services/geocoding.js#L38-L47
        ['countries', 'types', 'language'].indexOf(key) > -1
          ? (config[key] = self.options[key].split(/[\s,]+/))
          : (config[key] = self.options[key]);

        if (key === 'proximity' && self.options[key] && self.options[key].longitude && self.options[key].latitude) {
          config[key] = [self.options[key].longitude, self.options[key].latitude]
        }
      }
      return config;
    }, {});

    var request;
    // check if searchInput resembles coordinates, and if it does,
    // make the request a reverseGeocode
    if (
      this.options.reverseGeocode &&
      /(-?\d+\.?\d*)[, ]+(-?\d+\.?\d*)[ ]*$/.test(searchInput)
    ) {
      // parse coordinates
      var coords = searchInput.split(/[\s(,)?]+/).map(function(c) {
        return parseFloat(c, 10);
      }).reverse();

      // client only accepts one type for reverseGeocode, so
      // use first config type if one, if not default to poi
      config.types ? [config.types[0]] : ["poi"];
      config = extend(config, { query: coords, limit: 1 });
      request = geocoderService.reverseGeocode(config).send();
    } else {
      config = extend(config, { query: searchInput });
      request = geocoderService.forwardGeocode(config).send();
    }

    var localGeocoderRes = [];
    if (this.options.localGeocoder) {
      localGeocoderRes = this.options.localGeocoder(searchInput);
      if (!localGeocoderRes) {
        localGeocoderRes = [];
      }
    }

    request.then(
      function(response) {
        this._loadingEl.style.display = 'none';

        var res = {};

        if (response.statusCode == '200') {
          res = response.body;
        }

        // supplement Mapbox Geocoding API results with locally populated results
        res.features = res.features
          ? localGeocoderRes.concat(res.features)
          : localGeocoderRes;

        // apply results filter if provided
        if (this.options.filter && res.features.length) {
          res.features = res.features.filter(this.options.filter);
        }

        if (res.features.length) {
          this._clearEl.style.display = 'block';
        } else {
          this._clearEl.style.display = 'none';
          this._typeahead.selected = null;
        }

        res.config = config;
        if (this.fresh){
          this.eventManager.start(this);
          this.fresh = false;
        }
        this._eventEmitter.emit('results', res);
        this._typeahead.update(res.features);
      }.bind(this)
    );

    request.catch(
      function(err) {
        this._loadingEl.style.display = 'none';

        // in the event of an error in the Mapbox Geocoding API still display results from the localGeocoder
        if (localGeocoderRes.length) {
          this._clearEl.style.display = 'block';
        } else {
          this._clearEl.style.display = 'none';
          this._typeahead.selected = null;
        }

        this._eventEmitter.emit('results', { features: localGeocoderRes });
        this._typeahead.update(localGeocoderRes);
        this._eventEmitter.emit('error', { error: err });
      }.bind(this)
    );

    return request;
  },

  _clear: function(ev) {
    if (ev) ev.preventDefault();
    this._inputEl.value = '';
    this._typeahead.selected = null;
    this._typeahead.clear();
    this._onChange();
    this._inputEl.focus();
    this._clearEl.style.display = 'none';
    this._eventEmitter.emit('clear');
    // reset the turnstile event
    this.fresh = true;
  },

  _onQueryResult: function(response) {
    var results = response.body;
    if (!results.features.length) return;
    var result = results.features[0];
    this._typeahead.selected = result;
    this._inputEl.value = result.place_name;
    this._onChange();
  },

  _updateProximity: function() {
    // proximity is designed for local scale, if the user is looking at the whole world,
    // it doesn't make sense to factor in the arbitrary centre of the map
    if (this._map.getZoom() > 9) {
      var center = this._map.getCenter().wrap();
      this.setProximity({ longitude: center.lng, latitude: center.lat });
    } else {
      this.setProximity(null);
    }
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
   * Set proximity
   * @param {Object} proximity The new options.proximity value. This is a geographical point given as an object with latitude and longitude properties.
   * @returns {MapboxGeocoder} this
   */
  setProximity: function(proximity) {
    this.options.proximity = proximity;
    return this;
  },

  /**
   * Get proximity
   * @returns {Object} The geocoder proximity
   */
  getProximity: function() {
    return this.options.proximity;
  },

  /**
   * Subscribe to events that happen within the plugin.
   * @param {String} type name of event. Available events and the data passed into their respective event objects are:
   *
   * - __clear__ `Emitted when the input is cleared`
   * - __loading__ `{ query } Emitted when the geocoder is looking up a query`
   * - __results__ `{ results } Fired when the geocoder returns a response`
   * - __result__ `{ result } Fired when input is set`
   * - __error__ `{ error } Error as string`
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
