export = MapboxEventManager;
/**
 * Construct a new mapbox event client to send interaction events to the mapbox event service
 * @param {Object} options options with which to create the service
 * @param {String} options.accessToken the mapbox access token to make requests
 * @param {Number} [options.flushInterval=1000] the number of ms after which to flush the event queue
 * @param {Number} [options.maxQueueSize=100] the number of events to queue before flushing
 * @private
 */
declare class MapboxEventManager {
    constructor(options: any);
    origin: any;
    endpoint: string;
    access_token: any;
    version: string;
    pluginSessionID: string;
    sessionIncrementer: number;
    userAgent: string;
    options: any;
    /**
     * Send an event to the events service
     *
     * The event is skipped if the instance is not enabled to send logging events
     *
     * @private
     * @param {Object} payload the http POST body of the event
     * @param {Function} [callback] a callback function to invoke when the send has completed
     * @returns {Promise}
     */
    private send;
    countries: any;
    types: any;
    bbox: any;
    language: any;
    limit: number;
    locale: string;
    enableEventLogging: boolean;
    eventQueue: any[];
    flushInterval: any;
    maxQueueSize: any;
    timer: NodeJS.Timeout;
    lastSentInput: string;
    lastSentIndex: number;
    /**
     * Send a search.select event to the mapbox events service
     * This event marks the array index of the item selected by the user out of the array of possible options
     * @private
     * @param {Object} selected the geojson feature selected by the user
     * @param {Object} geocoder a mapbox-gl-geocoder instance
     * @returns {Promise}
     */
    private select;
    /**
     * Send a search-start event to the mapbox events service
     * This turnstile event marks when a user starts a new search
     * @private
     * @param {Object} geocoder a mapbox-gl-geocoder instance
     * @returns {Promise}
     */
    private start;
    /**
     * Send a search-keyevent event to the mapbox events service
     * This event records each keypress in sequence
     * @private
     * @param {Object} keyEvent the keydown event to log
     * @param {Object} geocoder a mapbox-gl-geocoder instance
     *
     */
    private keyevent;
    /**
     * Get http request options
     * @private
     * @param {*} payload
     */
    private getRequestOptions;
    /**
     * Get the event payload to send to the events service
     * Most payload properties are shared across all events
     * @private
     * @param {String} event the name of the event to send to the events service. Valid options are 'search.start', 'search.select', 'search.feedback'.
     * @param {Object} geocoder a mapbox-gl-geocoder instance
     * @param {Object} eventArgs Additional arguments needed for certain event types
     * @param {Object} eventArgs.key The key pressed by the user
     * @param {Object} eventArgs.selectedFeature GeoJSON Feature selected by the user
     * @returns {Object} an event payload
     */
    private getEventPayload;
    /**
     * Wraps the request function for easier testing
     * Make an http request and invoke a callback
     * @private
     * @param {Object} opts options describing the http request to be made
     * @param {Function} callback the callback to invoke when the http request is completed
     */
    private request;
    /**
     * Handle an error that occurred while making a request
     * @param {Object} err an error instance to log
     * @private
     */
    private handleError;
    /**
     * Generate a session ID to be returned with all of the searches made by this geocoder instance
     * ID is random and cannot be tracked across sessions
     * @private
     */
    private generateSessionID;
    /**
     * Get the a unique session ID for the current plugin session and increment the session counter.
     *
     * @returns {String} The session ID
     */
    getSessionId(): string;
    /**
     * Get a user agent string to send with the request to the events service
     * @private
     */
    private getUserAgent;
    /**
     * Get the 0-based numeric index of the item that the user selected out of the list of options
     * @private
     * @param {Object} selected the geojson feature selected by the user
     * @param {Object} geocoder a Mapbox-GL-Geocoder instance
     * @returns {Number} the index of the selected result
     */
    private getSelectedIndex;
    /** @private */
    private getSuggestionIds;
    /** @private */
    private getSuggestionNames;
    /** @private */
    private getSuggestionTypes;
    /** @private */
    private getSuggestionSources;
    /**
     * Get the correct schema version for the event
     * @private
     * @param {String} event Name of the event
     * @returns
     */
    private getEventSchemaVersion;
    /**
     * Checks if a payload has all the required properties for the event type
     * @private
     * @param {Object} payload
     * @returns
     */
    private validatePayload;
    /**
     * Checks of an object has all the required properties
     * @private
     * @param {Object} obj
     * @param {Array<String>} requiredProps
     * @returns
     */
    private objectHasRequiredProps;
    /**
     * Check whether events should be logged
     * Clients using a localGeocoder or an origin other than mapbox should not have events logged
     * @private
     */
    private shouldEnableLogging;
    /**
     * Flush out the event queue by sending events to the events service
     * @private
     */
    private flush;
    /**
     * Push event into the pending queue
     * @param {Object} evt the event to send to the events service
     * @param {Boolean} forceFlush indicates that the event queue should be flushed after adding this event regardless of size of the queue
     * @private
     */
    private push;
    /**
     * Flush any remaining events from the queue before it is removed
     * @private
     */
    private remove;
}
//# sourceMappingURL=events.d.ts.map