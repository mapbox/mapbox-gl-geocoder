'use strict';
var shajs = require('sha.js')
/**
 * Construct a new mapbox event client to send interaction events to the mapbox event service
 * @param {Object} options options with which to create the service
 * @param {String} options.accessToken the mapbox access token to make requests
 * @private
 */
function MapboxEventManager(options) {
  this.origin = options.origin || 'https://api.mapbox.com';
  this.endpoint = '/events/v2';
  this.access_token = options.accessToken;
  this.version = '0.0.1'
  this.sessionID = this.generateSessionID();
  this.userAgent = this.getUserAgent();
  // parse global options to be sent with each request
  this.countries = (options.countries) ? options.countries.split(",") : null;
  this.types = (options.types) ? options.types.split(",") : null;
  this.bbox = (options.bbox) ? options.bbox : null;
  this.language = (options.language) ? options.language.split(",") : null;
  this.limit = (options.limit) ? +options.limit : null;
  this.locale = navigator.language || null;
  this.enableEventLogging = this.shouldEnableLogging(options);
  // keep some state to deduplicate requests if necessary
  this.lastSentInput = "";
  this.lastSentIndex = 0;
}

MapboxEventManager.prototype = {

  /**
   * Send a search.select event to the mapbox events service
   * This event marks the array index of the item selected by the user out of the array of possible options
   * @private
   * @param {Object} selected the geojson feature selected by the user
   * @param {Object} geocoder a mapbox-gl-geocoder instance
   * @param {Function} callback a callback function to invoke once the event has been sent (optional)
   * @returns {Promise}
   */
  select: function (selected, geocoder, callback) {
    var resultIndex = this.getSelectedIndex(selected, geocoder);
    var payload = this.getEventPayload('search.select', geocoder);
    payload.resultIndex = resultIndex;
    if ((resultIndex === this.lastSentIndex && payload.queryString === this.lastSentInput) || resultIndex == -1) {
      // don't log duplicate events if the user re-selected the same feature on the same search
      if (callback) return callback();
      else return;
    }
    this.lastSentIndex = resultIndex;
    this.lastSentInput = payload.queryString;
    return this.send(payload, callback)
  },

  /**
   * Send a search-start event to the mapbox events service
   * This turnstile event marks when a user starts a new search
   * @private
   * @param {Object} geocoder a mapbox-gl-geocoder instance
   * @param {Function} callback 
   * @returns {Promise}
   */
  start: function (geocoder, callback) {
    var payload = this.getEventPayload('search.start', geocoder);
    return this.send(payload, callback);
  },

  /**
   * Send an event to the events service
   * 
   * The event is skipped if the instance is not enabled to send logging events
   * 
   * @private
   * @param {Object} payload the http POST body of the event
   * @returns {Promise}
   */
  send: function (payload, callback) {
    if (!callback) callback = function () {
      return
    };
    if (!this.enableEventLogging) {
      return callback();
    }
    var options = this.getRequestOptions(payload);
    this.request(options, function (err) {
      if (err) return this.handleError(err, callback);
      if (callback) return callback();
    })
  },
  /**
   * Get http request options
   * @private
   * @param {*} payload 
   */
  getRequestOptions: function (payload) {
    var options = {
      // events must be sent with POST
      method: "POST",
      host: this.origin,
      path: this.endpoint +  "?access_token=" + this.access_token,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([payload]) //events are arrays
    }
    return options
  },

  /**
   * Get the event payload to send to the events service
   * Most payload properties are shared across all events
   * @private
   * @param {String} event the name of the event to send to the events service. Valid options are 'search.start', 'search.select', 'search.feedback'.
   * @param {Object} geocoder a mapbox-gl-geocoder instance 
   * @returns {Object} an event payload 
   */
  getEventPayload: function (event, geocoder) {
    var proximity;
    if (!geocoder.options.proximity) proximity = null;
    else proximity = [geocoder.options.proximity.longitude, geocoder.options.proximity.latitude];

    var zoom = (geocoder._map) ? geocoder._map.getZoom() : null;
    return {
      event: event,
      created: +new Date(),
      sessionIdentifier: this.sessionID,
      country: this.countries,
      userAgent: this.userAgent,
      language: this.language,
      bbox: this.bbox,
      types: this.types,
      endpoint: 'mapbox.places',
      // fuzzyMatch: search.fuzzy, //todo  --> add to plugin
      proximity: proximity,
      limit: geocoder.options.limit,
      // routing: search.routing, //todo --> add to plugin
      queryString: geocoder.inputString,
      mapZoom: zoom,
      keyboardLocale: this.locale
    }
  },

  /**
   * Wraps the request function for easier testing
   * Make an http request and invoke a callback
   * @private
   * @param {Object} opts options describing the http request to be made
   * @param {Function} callback the callback to invoke when the http request is completed
   */
  request: function (opts, callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 ) {
        if (this.status == 204){
            //success
          return callback(null);
        }else {
          return callback(this.statusText);
        }
      }
    };
    xhttp.open(opts.method, opts.host + opts.path, true);
    for (var header in opts.headers){
      var headerValue = opts.headers[header];
      xhttp.setRequestHeader(header, headerValue)
    }
    xhttp.send(opts.body);
  },

  /**
   * Handle an error that occurred while making a request
   * @param {Object} err an error instance to log
   * @private
   */
  handleError: function (err, callback) {
    if (callback) return callback(err);
  },

  /**
   * Generate a session ID to be returned with all of the searches made by this geocoder instance
   * ID is random and cannot be tracked across sessions
   * @private
   */
  generateSessionID: function () {
    return new shajs.sha256().update(Math.random().toString()).digest('hex')
  },

  /**
   * Get a user agent string to send with the request to the events service
   * @private
   */
  getUserAgent: function () {
    return 'mapbox-gl-geocoder.' + this.version + "." + navigator.userAgent;
  },

  /**
   * Get the 0-based numeric index of the item that the user selected out of the list of options
   * @private
   * @param {Object} selected the geojson feature selected by the user
   * @param {Object} geocoder a Mapbox-GL-Geocoder instance
   * @returns {Number} the index of the selected result
   */
  getSelectedIndex: function (selected, geocoder) {
    var results = geocoder._typeahead.data;
    var selectedID = selected.id;
    var resultIDs = results.map(function (feature) {
      return feature.id;
    });
    var selectedIdx = resultIDs.indexOf(selectedID);
    return selectedIdx;
  },

  /**
   * Check whether events should be logged
   * Clients using a localGeocoder or an origin other than mapbox should not have events logged
   * @private
   */
  shouldEnableLogging: function (options) {
    if (this.origin.indexOf('api.mapbox.com')  == -1) return false;
    // hard to make sense of events when a local instance is suplementing results from origin
    if (options.localGeocoder) return false;
    // hard to make sense of events when a custom filter is in use
    if (options.filter) return false;
    return true;
  }
}



module.exports = MapboxEventManager;