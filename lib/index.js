'use strict';

var Typeahead = require('suggestions');
var debounce = require('lodash.debounce');
var extend = require('xtend');
var EventEmitter = require('events').EventEmitter;
var exceptions = require('./exceptions');
var MapboxClient = require('@mapbox/mapbox-sdk');
var mbxGeocoder = require('@mapbox/mapbox-sdk/services/geocoding');
var MapboxEventManager = require('./events');
var localization = require('./localization');
var subtag = require('subtag');


const GEOCODE_REQUEST_TYPE = {
  FORWARD: 0,
  LOCAL: 1,
  REVERSE: 2,
};

/**
 * A geocoder component using the [Mapbox Geocoding API](https://docs.mapbox.com/api/search/#geocoding)
 * @class MapboxGeocoder
 * @param {Object} options
 * @param {String} options.accessToken Required.
 * @param {String} [options.origin=https://api.mapbox.com] Use to set a custom API origin.
 * @param {Object} [options.mapboxgl] A [mapbox-gl](https://github.com/mapbox/mapbox-gl-js) instance to use when creating [Markers](https://docs.mapbox.com/mapbox-gl-js/api/#marker). Required if `options.marker` is `true`.
 * @param {Number} [options.zoom=16] On geocoded result what zoom level should the map animate to when a `bbox` isn't found in the response. If a `bbox` is found the map will fit to the `bbox`.
 * @param {Boolean|Object} [options.flyTo=true] If `false`, animating the map to a selected result is disabled. If `true`, animating the map will use the default animation parameters. If an object, it will be passed as `options` to the map [`flyTo`](https://docs.mapbox.com/mapbox-gl-js/api/#map#flyto) or [`fitBounds`](https://docs.mapbox.com/mapbox-gl-js/api/#map#fitbounds) method providing control over the animation of the transition.
 * @param {String} [options.placeholder=Search] Override the default placeholder attribute value.
 * @param {Object} [options.proximity] a proximity argument: this is
 * a geographical point given as an object with `latitude` and `longitude`
 * properties. Search results closer to this point will be given
 * higher priority.
 * @param {Boolean} [options.trackProximity=true] If `true`, the geocoder proximity will automatically update based on the map view.
 * @param {Boolean} [options.collapsed=false] If `true`, the geocoder control will collapse until hovered or in focus.
 * @param {Boolean} [options.clearAndBlurOnEsc=false] If `true`, the geocoder control will clear it's contents and blur when user presses the escape key.
 * @param {Boolean} [options.clearOnBlur=false] If `true`, the geocoder control will clear its value when the input blurs.
 * @param {Array} [options.bbox] a bounding box argument: this is
 * a bounding box given as an array in the format `[minX, minY, maxX, maxY]`.
 * Search results will be limited to the bounding box.
 * @param {string} [options.countries] a comma separated list of country codes to
 * limit results to specified country or countries.
 * @param {string} [options.types] a comma seperated list of types that filter
 * results to match those specified. See https://docs.mapbox.com/api/search/#data-types
 * for available types.
 * If reverseGeocode is enabled and no type is specified, the type defaults to POIs. Otherwise, if you configure more than one type, the first type will be used.
 * @param {Number} [options.minLength=2] Minimum number of characters to enter before results are shown.
 * @param {Number} [options.limit=5] Maximum number of results to show.
 * @param {string} [options.language] Specify the language to use for response text and query result weighting. Options are IETF language tags comprised of a mandatory ISO 639-1 language code and optionally one or more IETF subtags for country or script. More than one value can also be specified, separated by commas. Defaults to the browser's language settings.
 * @param {Function} [options.filter] A function which accepts a Feature in the [Carmen GeoJSON](https://github.com/mapbox/carmen/blob/master/carmen-geojson.md) format to filter out results from the Geocoding API response before they are included in the suggestions list. Return `true` to keep the item, `false` otherwise.
 * @param {Function} [options.localGeocoder] A function accepting the query string which performs local geocoding to supplement results from the Mapbox Geocoding API. Expected to return an Array of GeoJSON Features in the [Carmen GeoJSON](https://github.com/mapbox/carmen/blob/master/carmen-geojson.md) format.
 * @param {Function} [options.externalGeocoder] A function accepting the query string and current features list which performs geocoding to supplement results from the Mapbox Geocoding API. Expected to return a Promise which resolves to an Array of GeoJSON Features in the [Carmen GeoJSON](https://github.com/mapbox/carmen/blob/master/carmen-geojson.md) format.
 * @param {distance|score} [options.reverseMode=distance] - Set the factors that are used to sort nearby results.
 * @param {boolean} [options.reverseGeocode=false] If `true`, enable reverse geocoding mode. In reverse geocoding, search input is expected to be coordinates in the form `lat, lon`, with suggestions being the reverse geocodes.
 * @param {Boolean} [options.enableEventLogging=true] Allow Mapbox to collect anonymous usage statistics from the plugin.
 * @param {Boolean|Object} [options.marker=true]  If `true`, a [Marker](https://docs.mapbox.com/mapbox-gl-js/api/#marker) will be added to the map at the location of the user-selected result using a default set of Marker options.  If the value is an object, the marker will be constructed using these options. If `false`, no marker will be added to the map. Requires that `options.mapboxgl` also be set.
 * @param {Function} [options.render] A function that specifies how the results should be rendered in the dropdown menu. This function should accepts a single [Carmen GeoJSON](https://github.com/mapbox/carmen/blob/master/carmen-geojson.md) object as input and return a string. Any HTML in the returned string will be rendered.
 * @param {Function} [options.getItemValue] A function that specifies how the selected result should be rendered in the search bar. This function should accept a single [Carmen GeoJSON](https://github.com/mapbox/carmen/blob/master/carmen-geojson.md) object as input and return a string. HTML tags in the output string will not be rendered. Defaults to `(item) => item.place_name`.
 * @param {String} [options.mode=mapbox.places] A string specifying the geocoding [endpoint](https://docs.mapbox.com/api/search/#endpoints) to query. Options are `mapbox.places` and `mapbox.places-permanent`. The `mapbox.places-permanent` mode requires an enterprise license for permanent geocodes.
 * @param {Boolean} [options.localGeocoderOnly=false] If `true`, indicates that the `localGeocoder` results should be the only ones returned to the user. If `false`, indicates that the `localGeocoder` results should be combined with those from the Mapbox API with the `localGeocoder` results ranked higher.
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
  this.lastSelected = null;
}

MapboxGeocoder.prototype = {
  options: {
    zoom: 16,
    flyTo: true,
    trackProximity: true,
    minLength: 2,
    reverseGeocode: false,
    limit: 5,
    origin: 'https://api.mapbox.com',
    enableEventLogging: true,
    marker: true,
    mapboxgl: null,
    collapsed: false,
    clearAndBlurOnEsc: false,
    clearOnBlur: false,
    getItemValue: function(item) {
      return item.place_name
    },
    render: function(item) {
      var placeName = item.place_name.split(',');
      return '<div class="mapboxgl-ctrl-geocoder--suggestion"><div class="mapboxgl-ctrl-geocoder--suggestion-title">' + placeName[0]+ '</div><div class="mapboxgl-ctrl-geocoder--suggestion-address">' + placeName.splice(1, placeName.length).join(',') + '</div></div>';
    }
  },

  /**
   * Add the geocoder to a container. The container can be either a `mapboxgl.Map`, an `HTMLElement` or a CSS selector string.
   *
   * If the container is a [`mapboxgl.Map`](https://docs.mapbox.com/mapbox-gl-js/api/map/), this function will behave identically to [`Map.addControl(geocoder)`](https://docs.mapbox.com/mapbox-gl-js/api/map/#map#addcontrol).
   * If the container is an instance of [`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement), then the geocoder will be appended as a child of that [`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement).
   * If the container is a [CSS selector string](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors), the geocoder will be appended to the element returned from the query.
   *
   * This function will throw an error if the container is none of the above.
   * It will also throw an error if the referenced HTML element cannot be found in the `document.body`.
   *
   * For example, if the HTML body contains the element `<div id='geocoder-container'></div>`, the following script will append the geocoder to `#geocoder-container`:
   *
   * ```javascript
   * var geocoder = new MapboxGeocoder({ accessToken: mapboxgl.accessToken });
   * geocoder.addTo('#geocoder-container');
   * ```
   * @param {String|HTMLElement|mapboxgl.Map} container A reference to the container to which to add the geocoder
   */
  addTo: function(container){

    function addToExistingContainer (geocoder, container) {
      if (!document.body.contains(container)) {
        throw new Error("Element provided to #addTo() exists, but is not in the DOM")
      }
      const el = geocoder.onAdd(); //returns the input elements, which are then added to the requested html container
      container.appendChild(el);
    }

    // if the container is a map, add the control like normal
    if (container._controlContainer){
      //  it's a mapbox-gl map, add like normal
      container.addControl(this);
    }
    // if the container is an HTMLElement, then set the parent to be that element
    else if (container instanceof HTMLElement) {
      addToExistingContainer(this, container);
    }
    // if the container is a string, treat it as a CSS query
    else if (typeof container == 'string'){
      const parent = document.querySelectorAll(container);
      if (parent.length === 0){
        throw new Error("Element ", container, "not found.")
      }

      if (parent.length > 1){
        throw new Error("Geocoder can only be added to a single html element")
      }

      addToExistingContainer(this, parent[0]);
    }else{
      throw new Error("Error: addTo must be a mapbox-gl-js map, an html element, or a CSS selector query for a single html element")
    }
  },

  onAdd: function(map) {
    if (map && typeof map != 'string'){
      this._map = map;
    }

    this.setLanguage();

    if (!this.options.localGeocoderOnly){
      this.geocoderService = mbxGeocoder(
        MapboxClient({
          accessToken: this.options.accessToken,
          origin: this.options.origin
        })
      );
    }

    if (this.options.localGeocoderOnly && !this.options.localGeocoder){
      throw new Error("A localGeocoder function must be specified to use localGeocoderOnly mode")
    }

    this.eventManager = new MapboxEventManager(this.options);

    this._onChange = this._onChange.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onPaste = this._onPaste.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._showButton = this._showButton.bind(this);
    this._hideButton = this._hideButton.bind(this);
    this._onQueryResult = this._onQueryResult.bind(this);
    this.clear = this.clear.bind(this);
    this._updateProximity = this._updateProximity.bind(this);
    this._collapse = this._collapse.bind(this);
    this._unCollapse = this._unCollapse.bind(this);
    this._clear = this._clear.bind(this);
    this._clearOnBlur = this._clearOnBlur.bind(this);

    var el = (this.container = document.createElement('div'));
    el.className = 'mapboxgl-ctrl-geocoder mapboxgl-ctrl';

    var searchIcon = this.createIcon('search', '<path d="M7.4 2.5c-2.7 0-4.9 2.2-4.9 4.9s2.2 4.9 4.9 4.9c1 0 1.8-.2 2.5-.8l3.7 3.7c.2.2.4.3.8.3.7 0 1.1-.4 1.1-1.1 0-.3-.1-.5-.3-.8L11.4 10c.4-.8.8-1.6.8-2.5.1-2.8-2.1-5-4.8-5zm0 1.6c1.8 0 3.2 1.4 3.2 3.2s-1.4 3.2-3.2 3.2-3.3-1.3-3.3-3.1 1.4-3.3 3.3-3.3z"/>')

    this._inputEl = document.createElement('input');
    this._inputEl.type = 'text';
    this._inputEl.className = 'mapboxgl-ctrl-geocoder--input';

    this.setPlaceholder();

    if (this.options.collapsed) {
      this._collapse();
      this.container.addEventListener('mouseenter', this._unCollapse);
      this.container.addEventListener('mouseleave', this._collapse);
      this._inputEl.addEventListener('focus', this._unCollapse);
    }

    if (this.options.collapsed || this.options.clearOnBlur) {
      this._inputEl.addEventListener('blur', this._onBlur);
    }

    this._inputEl.addEventListener('keydown', debounce(this._onKeyDown, 200));
    this._inputEl.addEventListener('paste', this._onPaste);
    this._inputEl.addEventListener('change', this._onChange);
    this.container.addEventListener('mouseenter', this._showButton);
    this.container.addEventListener('mouseleave', this._hideButton);
    this._inputEl.addEventListener('keyup', function(e){
      this.eventManager.keyevent(e, this);
    }.bind(this));

    var actions = document.createElement('div');
    actions.classList.add('mapboxgl-ctrl-geocoder--pin-right');

    this._clearEl = document.createElement('button');
    this._clearEl.setAttribute('aria-label', 'Clear');
    this._clearEl.addEventListener('click', this.clear);
    this._clearEl.className = 'mapboxgl-ctrl-geocoder--button';

    var buttonIcon = this.createIcon('close', '<path d="M3.8 2.5c-.6 0-1.3.7-1.3 1.3 0 .3.2.7.5.8L7.2 9 3 13.2c-.3.3-.5.7-.5 1 0 .6.7 1.3 1.3 1.3.3 0 .7-.2 1-.5L9 10.8l4.2 4.2c.2.3.7.3 1 .3.6 0 1.3-.7 1.3-1.3 0-.3-.2-.7-.3-1l-4.4-4L15 4.6c.3-.2.5-.5.5-.8 0-.7-.7-1.3-1.3-1.3-.3 0-.7.2-1 .3L9 7.1 4.8 2.8c-.3-.1-.7-.3-1-.3z"/>')
    this._clearEl.appendChild(buttonIcon);

    this._loadingEl = this.createIcon('loading', '<path fill="#333" d="M4.4 4.4l.8.8c2.1-2.1 5.5-2.1 7.6 0l.8-.8c-2.5-2.5-6.7-2.5-9.2 0z"/><path opacity=".1" d="M12.8 12.9c-2.1 2.1-5.5 2.1-7.6 0-2.1-2.1-2.1-5.5 0-7.7l-.8-.8c-2.5 2.5-2.5 6.7 0 9.2s6.6 2.5 9.2 0 2.5-6.6 0-9.2l-.8.8c2.2 2.1 2.2 5.6 0 7.7z"/>');

    actions.appendChild(this._clearEl);
    actions.appendChild(this._loadingEl);

    el.appendChild(searchIcon);
    el.appendChild(this._inputEl);
    el.appendChild(actions);

    this._typeahead = new Typeahead(this._inputEl, [], {
      filter: false,
      minLength: this.options.minLength,
      limit: this.options.limit
    });

    this.setRenderFunction(this.options.render);
    this._typeahead.getItemValue = this.options.getItemValue;

    this.mapMarker = null;
    this._handleMarker = this._handleMarker.bind(this);
    if (this._map){
      if (this.options.trackProximity ) {
        this._updateProximity();
        this._map.on('moveend', this._updateProximity);
      }
      this._mapboxgl = this.options.mapboxgl;
      if (!this._mapboxgl && this.options.marker) {
        // eslint-disable-next-line no-console
        console.error("No mapboxgl detected in options. Map markers are disabled. Please set options.mapboxgl.");
        this.options.marker = false;
      }
    }
    return el;
  },

  createIcon: function(name, path) {
    var icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('class', 'mapboxgl-ctrl-geocoder--icon mapboxgl-ctrl-geocoder--icon-' + name);
    icon.setAttribute('viewBox', '0 0 18 18');
    icon.setAttribute('xml:space','preserve');
    icon.setAttribute('width', 18);
    icon.setAttribute('height', 18);
    // IE does not have innerHTML for SVG nodes
    if (!('innerHTML' in icon)) {
      var SVGNodeContainer = document.createElement('div');
      SVGNodeContainer.innerHTML = '<svg>' + path.valueOf().toString() + '</svg>';
      var SVGNode = SVGNodeContainer.firstChild,
        SVGPath = SVGNode.firstChild;
      icon.appendChild(SVGPath);
    } else {
      icon.innerHTML = path;
    }
    return icon;
  },

  onRemove: function() {
    this.container.parentNode.removeChild(this.container);

    if (this.options.trackProximity && this._map) {
      this._map.off('moveend', this._updateProximity);
    }

    this._removeMarker();

    this._map = null;

    return this;
  },

  _onPaste: function(e){
    var value = (e.clipboardData || window.clipboardData).getData('text');
    if (value.length >= this.options.minLength) {
      this._geocode(value);
    }
  },

  _onKeyDown: function(e) {
    var ESC_KEY_CODE = 27,
      TAB_KEY_CODE = 9;

    if (e.keyCode === ESC_KEY_CODE && this.options.clearAndBlurOnEsc) {
      this._clear(e);
      return this._inputEl.blur();
    }

    // if target has shadowRoot, then get the actual active element inside the shadowRoot
    var target = e.target && e.target.shadowRoot
      ? e.target.shadowRoot.activeElement
      : e.target;
    var value = target ? target.value : '';

    if (!value) {
      this.fresh = true;
      // the user has removed all the text
      if (e.keyCode !== TAB_KEY_CODE) this.clear(e);
      return (this._clearEl.style.display = 'none');
    }

    // TAB, ESC, LEFT, RIGHT, ENTER, UP, DOWN
    if ((e.metaKey || [TAB_KEY_CODE, ESC_KEY_CODE, 37, 39, 13, 38, 40].indexOf(e.keyCode) !== -1))
      return;

    if (target.value.length >= this.options.minLength) {
      this._geocode(target.value);
    }
  },

  _showButton: function() {
    if (this._typeahead.selected) this._clearEl.style.display = 'block';
  },

  _hideButton: function() {
    if (this._typeahead.selected) this._clearEl.style.display = 'none';
  },

  _onBlur: function(e) {
    if (this.options.clearOnBlur) {
      this._clearOnBlur(e);
    }
    if (this.options.collapsed) {
      this._collapse();
    }
  },
  _onChange: function() {
    var selected = this._typeahead.selected;
    if (selected  && JSON.stringify(selected) !== this.lastSelected) {
      this._clearEl.style.display = 'none';
      if (this.options.flyTo) {
        var flyOptions;
        if (selected.properties && exceptions[selected.properties.short_code]) {
          // Certain geocoder search results return (and therefore zoom to fit)
          // an unexpectedly large bounding box: for example, both Russia and the
          // USA span both sides of -180/180, or France includes the island of
          // Reunion in the Indian Ocean. An incomplete list of these exceptions
          // at ./exceptions.json provides "reasonable" bounding boxes as a
          // short-term solution; this may be amended as necessary.
          flyOptions = extend({}, this.options.flyTo);
          if (this._map){
            this._map.fitBounds(exceptions[selected.properties.short_code].bbox, flyOptions);
          }
        } else if (selected.bbox) {
          var bbox = selected.bbox;
          flyOptions = extend({}, this.options.flyTo);
          if (this._map){
            this._map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], flyOptions);
          }
        } else {
          var defaultFlyOptions = {
            zoom: this.options.zoom
          }
          flyOptions = extend({}, defaultFlyOptions, this.options.flyTo);
          //  ensure that center is not overriden by custom options
          if (selected.center) {
            flyOptions.center = selected.center;
          } else if (selected.geometry && selected.geometry.type && selected.geometry.type === 'Point' && selected.geometry.coordinates) {
            flyOptions.center = selected.geometry.coordinates;
          }

          if (this._map){
            this._map.flyTo(flyOptions);
          }
        }
      }
      if (this.options.marker && this._mapboxgl){
        this._handleMarker(selected);
      }

      // After selecting a feature, re-focus the textarea and set
      // cursor at start.
      this._inputEl.focus();
      this._inputEl.scrollLeft = 0;
      this._inputEl.setSelectionRange(0, 0);
      this.lastSelected = JSON.stringify(selected);
      this._eventEmitter.emit('result', { result: selected });
      this.eventManager.select(selected, this);
    }
  },

  _requestType: function(options, search) {
    var type;
    const reverseGeocodeCoordRgx = /^[ ]*(-?\d+\.?\d*)[, ]+(-?\d+\.?\d*)[ ]*$/;
    if (options.localGeocoderOnly) {
      type = GEOCODE_REQUEST_TYPE.LOCAL;
    } else if (options.reverseGeocode && reverseGeocodeCoordRgx.test(search)) {
      type = GEOCODE_REQUEST_TYPE.REVERSE;
    } else {
      type = GEOCODE_REQUEST_TYPE.FORWARD;
    }
    return type;
  },

  _setupConfig: function(requestType, search) {
    // Possible config properties to pass to client
    const keys = [
      'bbox',
      'limit',
      'proximity',
      'countries',
      'types',
      'language',
      'reverseMode',
      'mode'
    ];
    const spacesOrCommaRgx = /[\s,]+/;

    var self = this;
    var config = keys.reduce(function(config, key) {
      if (!self.options[key]) {
        return config;
      }

      // countries, types, and language need to be passed in as arrays to client
      // https://github.com/mapbox/mapbox-sdk-js/blob/master/services/geocoding.js#L38-L47
      ['countries', 'types', 'language'].indexOf(key) > -1
        ? (config[key] = self.options[key].split(spacesOrCommaRgx))
        : (config[key] = self.options[key]);

      const isCoordKey =
        typeof self.options[key].longitude === 'number' &&
        typeof self.options[key].latitude  === 'number';

      if (key === 'proximity' && isCoordKey) {
        const lng = self.options[key].longitude;
        const lat = self.options[key].latitude;

        config[key] = [lng, lat];
      }

      return config;
    }, {});

    switch (requestType) {
    case GEOCODE_REQUEST_TYPE.REVERSE: {
      var coords = search.split(spacesOrCommaRgx).map(function(c) {
        return parseFloat(c, 10);
      }).reverse();

      // client only accepts one type for reverseGeocode, so
      // use first config type if one, if not default to poi
      config.types ? [config.types[0]] : ["poi"];
      config = extend(config, { query: coords, limit: 1 });

      // drop proximity which may have been set by trackProximity
      // since it's not supported by the reverseGeocoder
      if ('proximity' in config) {
        delete config.proximity;
      }
    } break;
    case GEOCODE_REQUEST_TYPE.FORWARD: {
      // Ensure that any reverse geocoding looking request is cleaned up
      // to be processed as only a forward geocoding request by the server.
      const reverseGeocodeCoordRgx = /^[ ]*(-?\d+\.?\d*)[, ]+(-?\d+\.?\d*)*[ ]*$/;
      if (reverseGeocodeCoordRgx.test(search)) {
        search = search.replace(/,/g, ' ');
      }
      config = extend(config, { query: search });
    } break;
    }

    return config;
  },

  _geocode: function(searchInput) {
    this.inputString = searchInput;
    this._loadingEl.style.display = 'block';
    this._eventEmitter.emit('loading', { query: searchInput });

    const requestType = this._requestType(this.options, searchInput);
    const config = this._setupConfig(requestType, searchInput);

    var request;
    switch (requestType) {
    case GEOCODE_REQUEST_TYPE.LOCAL:
      request = Promise.resolve();
      break;
    case GEOCODE_REQUEST_TYPE.FORWARD:
      request = this.geocoderService.forwardGeocode(config).send();
      break;
    case GEOCODE_REQUEST_TYPE.REVERSE:
      request = this.geocoderService.reverseGeocode(config).send();
      break;
    }

    var localGeocoderRes = this.options.localGeocoder ? this.options.localGeocoder(searchInput) || [] : [];
    var externalGeocoderRes = [];

    var geocoderError = null;
    request.catch(function(error) {
      geocoderError = error;
    }.bind(this))
      .then(
        function(response) {
          this._loadingEl.style.display = 'none';

          var res = {};

          if (!response){
            res = {
              type: 'FeatureCollection',
              features: []
            }
          } else if (response.statusCode == '200') {
            res = response.body;
            res.request = response.request
            res.headers = response.headers
          }

          res.config = config;

          if (this.fresh){
            this.eventManager.start(this);
            this.fresh = false;
          }

          // supplement Mapbox Geocoding API results with locally populated results
          res.features = res.features
            ? localGeocoderRes.concat(res.features)
            : localGeocoderRes;

          if (this.options.externalGeocoder) {

            externalGeocoderRes = this.options.externalGeocoder(searchInput, res.features) || [];
            // supplement Mapbox Geocoding API results with features returned by a promise
            return externalGeocoderRes.then(function(features) {
              res.features = res.features ? features.concat(res.features) : features;
              return res;
            }, function(){
              // on error, display the original result
              return res;
            });
          }
          return res;

        }.bind(this)).then(
        function(res) {
          if (geocoderError) {
            throw geocoderError;
          }

          // apply results filter if provided
          if (this.options.filter && res.features.length) {
            res.features = res.features.filter(this.options.filter);
          }

          if (res.features.length) {
            this._clearEl.style.display = 'block';
            this._eventEmitter.emit('results', res);
            this._typeahead.update(res.features);
          } else {
            this._clearEl.style.display = 'none';
            this._typeahead.selected = null;
            this._renderNoResults();
            this._eventEmitter.emit('results', res);
          }

        }.bind(this)
      ).catch(
        function(err) {
          this._loadingEl.style.display = 'none';

          // in the event of an error in the Mapbox Geocoding API still display results from the localGeocoder
          if ((localGeocoderRes.length && this.options.localGeocoder) || (externalGeocoderRes.length && this.options.externalGeocoder) ) {
            this._clearEl.style.display = 'block';
            this._typeahead.update(localGeocoderRes);
          } else {
            this._clearEl.style.display = 'none';
            this._typeahead.selected = null;
            this._renderError();
          }

          this._eventEmitter.emit('results', { features: localGeocoderRes });
          this._eventEmitter.emit('error', { error: err });
        }.bind(this)
      );

    return request;
  },

  /**
   * Shared logic for clearing input
   * @param {Event} [ev] the event that triggered the clear, if available
   * @private
   *
   */
  _clear: function(ev) {
    if (ev) ev.preventDefault();
    this._inputEl.value = '';
    this._typeahead.selected = null;
    this._typeahead.clear();
    this._onChange();
    this._clearEl.style.display = 'none';
    this._removeMarker();
    this.lastSelected = null;
    this._eventEmitter.emit('clear');
    this.fresh = true;
  },

  /**
   * Clear and then focus the input.
   * @param {Event} [ev] the event that triggered the clear, if available
   *
   */
  clear: function(ev) {
    this._clear(ev);
    this._inputEl.focus();
  },


  /**
   * Clear the input, without refocusing it. Used to implement clearOnBlur
   * constructor option.
   * @param {Event} [ev] the blur event
   * @private
   */
  _clearOnBlur: function(ev) {
    var ctx = this;

    /*
     * If relatedTarget is not found, assume user targeted the suggestions list.
     * In that case, do not clear on blur. There are other edge cases where
     * ev.relatedTarget could be null. Clicking on list always results in null
     * relatedtarget because of upstream behavior in `suggestions`.
     *
     * The ideal solution would be to check if ev.relatedTarget is a child of
     * the list. See issue #258 for details on why we can't do that yet.
     */
    if (ev.relatedTarget) {
      ctx._clear(ev);
    }
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
    if (!this._map){
      return;
    }
    if (this._map.getZoom() > 9) {
      var center = this._map.getCenter().wrap();
      this.setProximity({ longitude: center.lng, latitude: center.lat });
    } else {
      this.setProximity(null);
    }
  },

  _collapse: function() {
    // do not collapse if input is in focus
    if (!this._inputEl.value && this._inputEl !== document.activeElement) this.container.classList.add('mapboxgl-ctrl-geocoder--collapsed');
  },

  _unCollapse: function() {
    this.container.classList.remove('mapboxgl-ctrl-geocoder--collapsed');
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

  _renderError: function(){
    var errorMessage = "<div class='mapbox-gl-geocoder--error'>There was an error reaching the server</div>"
    this._renderMessage(errorMessage);
  },

  _renderNoResults: function(){
    var errorMessage = "<div class='mapbox-gl-geocoder--error mapbox-gl-geocoder--no-results'>No results found</div>";
    this._renderMessage(errorMessage);
  },

  _renderMessage: function(msg){
    this._typeahead.update([]);
    this._typeahead.selected = null;
    this._typeahead.clear();
    this._typeahead.renderError(msg);
  },

  /**
   * Get the text to use as the search bar placeholder
   *
   * If placeholder is provided in options, then use options.placeholder
   * Otherwise, if language is provided in options, then use the localized string of the first language if available
   * Otherwise use the default
   *
   * @returns {String} the value to use as the search bar placeholder
   * @private
   */
  _getPlaceholderText: function(){
    if (this.options.placeholder) return this.options.placeholder;
    if (this.options.language){
      var firstLanguage = this.options.language.split(",")[0];
      var language = subtag.language(firstLanguage);
      var localizedValue = localization.placeholder[language];
      if (localizedValue)  return localizedValue;
    }
    return 'Search';
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
    if (searchInput.length >= this.options.minLength) {
      this._geocode(searchInput);
    }
    return this;
  },

  /**
   * Set proximity
   * @param {Object} proximity The new `options.proximity` value. This is a geographical point given as an object with `latitude` and `longitude` properties.
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
   * Set the render function used in the results dropdown
   * @param {Function} fn The function to use as a render function. This function accepts a single [Carmen GeoJSON](https://github.com/mapbox/carmen/blob/master/carmen-geojson.md) object as input and returns a string.
   * @returns {MapboxGeocoder} this
   */
  setRenderFunction: function(fn){
    if (fn && typeof(fn) == "function"){
      this._typeahead.render = fn;
    }
    return this;
  },

  /**
   * Get the function used to render the results dropdown
   *
   * @returns {Function} the render function
   */
  getRenderFunction: function(){
    return this._typeahead.render;
  },

  /**
   * Get the language to use in UI elements and when making search requests
   *
   * Look first at the explicitly set options otherwise use the browser's language settings
   * @param {String} language Specify the language to use for response text and query result weighting. Options are IETF language tags comprised of a mandatory ISO 639-1 language code and optionally one or more IETF subtags for country or script. More than one value can also be specified, separated by commas.
   * @returns {MapboxGeocoder} this
   */
  setLanguage: function(language){
    var browserLocale = navigator.language || navigator.userLanguage || navigator.browserLanguage;
    this.options.language = language || this.options.language || browserLocale;
    return this;
  },

  /**
   * Get the language to use in UI elements and when making search requests
   * @returns {String} The language(s) used by the plugin, if any
   */
  getLanguage: function(){
    return this.options.language;
  },

  /**
   * Get the zoom level the map will move to when there is no bounding box on the selected result
   * @returns {Number} the map zoom
   */
  getZoom: function(){
    return this.options.zoom;
  },

  /**
   * Set the zoom level
   * @param {Number} zoom The zoom level that the map should animate to when a `bbox` isn't found in the response. If a `bbox` is found the map will fit to the `bbox`.
   * @returns {MapboxGeocoder} this
   */
  setZoom: function(zoom){
    this.options.zoom = zoom;
    return this;
  },

  /**
   * Get the parameters used to fly to the selected response, if any
   * @returns {Boolean|Object} The `flyTo` option
   */
  getFlyTo: function(){
    return this.options.flyTo;
  },

  /**
   * Set the flyTo options
   * @param {Boolean|Object} flyTo If false, animating the map to a selected result is disabled. If true, animating the map will use the default animation parameters. If an object, it will be passed as `options` to the map [`flyTo`](https://docs.mapbox.com/mapbox-gl-js/api/#map#flyto) or [`fitBounds`](https://docs.mapbox.com/mapbox-gl-js/api/#map#fitbounds) method providing control over the animation of the transition.
   */
  setFlyTo: function(flyTo){
    this.options.flyTo = flyTo;
    return this;
  },

  /**
   * Get the value of the placeholder string
   * @returns {String} The input element's placeholder value
   */
  getPlaceholder: function(){
    return this.options.placeholder;
  },

  /**
   * Set the value of the input element's placeholder
   * @param {String} placeholder the text to use as the input element's placeholder
   * @returns {MapboxGeocoder} this
   */
  setPlaceholder: function(placeholder){
    this.placeholder = (placeholder) ? placeholder : this._getPlaceholderText();
    this._inputEl.placeholder = this.placeholder;
    this._inputEl.setAttribute('aria-label', this.placeholder);
    return this
  },

  /**
   * Get the bounding box used by the plugin
   * @returns {Array<Number>} the bounding box, if any
   */
  getBbox: function(){
    return this.options.bbox;
  },

  /**
   * Set the bounding box to limit search results to
   * @param {Array<Number>} bbox a bounding box given as an array in the format [minX, minY, maxX, maxY].
   * @returns {MapboxGeocoder} this
   */
  setBbox: function(bbox){
    this.options.bbox = bbox;
    return this;
  },

  /**
   * Get a list of the countries to limit search results to
   * @returns {String} a comma separated list of countries to limit to, if any
   */
  getCountries: function(){
    return this.options.countries;
  },

  /**
   * Set the countries to limit search results to
   * @param {String} countries a comma separated list of countries to limit to
   * @returns {MapboxGeocoder} this
   */
  setCountries: function(countries){
    this.options.countries = countries;
    return this;
  },

  /**
   * Get a list of the types to limit search results to
   * @returns {String} a comma separated list of types to limit to
   */
  getTypes: function(){
    return this.options.types;
  },

  /**
   * Set the types to limit search results to
   * @param {String} countries a comma separated list of types to limit to
   * @returns {MapboxGeocoder} this
   */
  setTypes: function(types){
    this.options.types = types;
    return this;
  },

  /**
   * Get the minimum number of characters typed to trigger results used in the plugin
   * @returns {Number} The minimum length in characters before a search is triggered
   */
  getMinLength: function(){
    return this.options.minLength;
  },

  /**
   * Set the minimum number of characters typed to trigger results used by the plugin
   * @param {Number} minLength the minimum length in characters
   * @returns {MapboxGeocoder} this
   */
  setMinLength: function(minLength){
    this.options.minLength = minLength;
    if (this._typeahead)  this._typeahead.options.minLength = minLength;
    return this;
  },

  /**
   * Get the limit value for the number of results to display used by the plugin
   * @returns {Number} The limit value for the number of results to display used by the plugin
   */
  getLimit: function(){
    return this.options.limit;
  },

  /**
   * Set the limit value for the number of results to display used by the plugin
   * @param {Number} limit the number of search results to return
   * @returns {MapboxGeocoder}
   */
  setLimit: function(limit){
    this.options.limit = limit;
    if (this._typeahead) this._typeahead.options.limit = limit;
    return this;
  },

  /**
   * Get the filter function used by the plugin
   * @returns {Function} the filter function
   */
  getFilter: function(){
    return this.options.filter;
  },

  /**
   * Set the filter function used by the plugin.
   * @param {Function} filter A function which accepts a Feature in the [Carmen GeoJSON](https://github.com/mapbox/carmen/blob/master/carmen-geojson.md) format to filter out results from the Geocoding API response before they are included in the suggestions list. Return `true` to keep the item, `false` otherwise.
   * @returns {MapboxGeocoder} this
   */
  setFilter: function(filter){
    this.options.filter = filter;
    return this;
  },

  /**
   * Set the geocoding endpoint used by the plugin.
   * @param {Function} origin A function which accepts an HTTPS URL to specify the endpoint to query results from.
   * @returns {MapboxGeocoder} this
   */
  setOrigin: function(origin){
    this.options.origin = origin;
    this.geocoderService = mbxGeocoder(
      MapboxClient({
        accessToken: this.options.accessToken,
        origin: this.options.origin
      })
    );
    return this;
  },

  /**
   * Get the geocoding endpoint the plugin is currently set to
   * @returns {Function} the endpoint URL
   */
  getOrigin: function(){
    return this.options.origin;
  },

  /**
   * Handle the placement of a result marking the selected result
   * @private
   * @param {Object} selected the selected geojson feature
   * @returns {MapboxGeocoder} this
   */
  _handleMarker: function(selected){
    // clean up any old marker that might be present
    if (!this._map){
      return;
    }
    this._removeMarker();
    var defaultMarkerOptions = {
      color: '#4668F2'
    }
    var markerOptions = extend({}, defaultMarkerOptions, this.options.marker)
    this.mapMarker = new this._mapboxgl.Marker(markerOptions);
    if (selected.center) {
      this.mapMarker
        .setLngLat(selected.center)
        .addTo(this._map);
    } else if (selected.geometry && selected.geometry.type && selected.geometry.type === 'Point' && selected.geometry.coordinates) {
      this.mapMarker
        .setLngLat(selected.geometry.coordinates)
        .addTo(this._map);
    }
    return this;
  },

  /**
   * Handle the removal of a result marker
   * @private
   */
  _removeMarker: function(){
    if (this.mapMarker){
      this.mapMarker.remove();
      this.mapMarker = null;
    }
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
    this.eventManager.remove();
    return this;
  }
};

module.exports = MapboxGeocoder;
