export = MapboxGeocoder;
/**
 * A geocoder component using the [Mapbox Geocoding API](https://docs.mapbox.com/api/search/#geocoding)
 * @class MapboxGeocoder
 * @param {MapboxGeocoderOptions} options
 * @example
 * var geocoder = new MapboxGeocoder({ accessToken: mapboxgl.accessToken });
 * map.addControl(geocoder);
 */
declare class MapboxGeocoder {
    /** @param {MapboxGeocoderOptions} options */
    constructor(options: MapboxGeocoderOptions);
    _eventEmitter: EventEmitter;
    options: any;
    inputString: string;
    fresh: boolean;
    lastSelected: string;
    geolocation: Geolocation;
    _headers: {};
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
     * @param {string | HTMLElement | import('mapbox-gl').Map} container A reference to the container to which to add the geocoder
     */
    addTo(container: string | HTMLElement | import("mapbox-gl").Map): void;
    /**
     * Add the geocoder to a map.
     * @param {import('mapbox-gl').Map} [map]
     * @returns {HTMLElement}
     */
    onAdd(map?: import("mapbox-gl").Map): HTMLElement;
    _map: mapboxgl.Map;
    geocoderService: any;
    eventManager: MapboxEventManager;
    /** @private */
    private _onChange;
    /** @private */
    private _onKeyDown;
    /** @private */
    private _onPaste;
    /** @private */
    private _onBlur;
    /** @private */
    private _showButton;
    /** @private */
    private _hideButton;
    /** @private */
    private _onQueryResult;
    /**
     * Clear and then focus the input.
     * @param {Event} [ev] the event that triggered the clear, if available
     *
     */
    clear(ev?: Event): void;
    /** @private */
    private _updateProximity;
    /** @private */
    private _collapse;
    /** @private */
    private _unCollapse;
    /**
     * Shared logic for clearing input
     * @param {Event} [ev] the event that triggered the clear, if available
     * @private
     *
     */
    private _clear;
    /**
     * Clear the input, without refocusing it. Used to implement clearOnBlur
     * constructor option.
     * @param {Event} [ev] the blur event
     * @private
     */
    private _clearOnBlur;
    /** @private */
    private _geolocateUser;
    /** @private */
    private _onSuggestionItemFocus;
    _onSuggestionItemKeyDown: any;
    container: HTMLDivElement;
    _inputEl: HTMLInputElement;
    _clearEl: HTMLButtonElement;
    _loadingEl: SVGSVGElement;
    _geolocateEl: HTMLButtonElement;
    _typeahead: any;
    _footerNode: HTMLDivElement;
    mapMarker: any;
    /**
     * Handle the placement of a result marking the selected result
     * @private
     * @param {Object} selected the selected geojson feature
     * @returns {MapboxGeocoder} this
     */
    private _handleMarker;
    _mapboxgl: any;
    /** @private */
    private _onSuggestionItemKeydown;
    /** @private */
    private createIcon;
    /**
     * Remove the geocoder from a map.
     * @returns {MapboxGeocoder}
     */
    onRemove(): MapboxGeocoder;
    /** @private */
    private _setInputValue;
    /** @private */
    private _showClearButton;
    /** @private */
    private _hideClearButton;
    /** @private */
    private _showGeolocateButton;
    /** @private */
    private _hideGeolocateButton;
    /** @private */
    private _showLoadingIcon;
    /** @private */
    private _hideLoadingIcon;
    /** @private */
    private _showAttribution;
    /** @private */
    private _hideAttribution;
    /** @private */
    private _fly;
    /** @private */
    private _requestType;
    /** @private */
    private _setupConfig;
    /** @private */
    private _geocode;
    /**
     * Set & query the input
     * @param {string} searchInput location name or other search input
     * @returns {MapboxGeocoder} this
     */
    query(searchInput: string): MapboxGeocoder;
    /** @private */
    private _renderError;
    /** @private */
    private _renderLocationError;
    /** @private */
    private _renderNoResults;
    /** @private */
    private _renderUserDeniedGeolocationError;
    /** @private */
    private _renderMessage;
    /**
     * Get the text to use as the search bar placeholder
     *
     * If placeholder is provided in options, then use options.placeholder
     * Otherwise, if language is provided in options, then use the localized string of the first language if available
     * Otherwise use the default
     *
     * @returns {string} the value to use as the search bar placeholder
     * @private
     */
    private _getPlaceholderText;
    /**
     * Set input
     * @param {string} searchInput location name or other search input
     * @param {boolean} [showSuggestions=false] display suggestion on setInput call
     * @returns {MapboxGeocoder} this
     */
    setInput(searchInput: string, showSuggestions?: boolean): MapboxGeocoder;
    /**
     * Set proximity
     * @param {MapboxGeocoderProximity | 'ip' | null} proximity The new `options.proximity` value. This is a geographical point given as an object with `latitude` and `longitude` properties or the string 'ip'.
     * @param {boolean} disableTrackProximity If true, sets `trackProximity` to false. True by default to prevent `trackProximity` from unintentionally overriding an explicitly set proximity value.
     * @returns {MapboxGeocoder} this
     */
    setProximity(proximity: MapboxGeocoderProximity | "ip" | null, disableTrackProximity?: boolean): MapboxGeocoder;
    /**
     * Get proximity
     * @returns {MapboxGeocoderProximity | 'ip' | undefined} The geocoder proximity
     */
    getProximity(): MapboxGeocoderProximity | "ip" | undefined;
    /**
     * Set the render function used in the results dropdown
     * @param {MapboxGeocoderRenderFunction} fn The function to use as a render function. This function accepts a single extended GeoJSON object as input and returns a string.
     * @returns {MapboxGeocoder} this
     */
    setRenderFunction(fn: MapboxGeocoderRenderFunction): MapboxGeocoder;
    /**
     * Get the function used to render the results dropdown
     *
     * @returns {MapboxGeocoderRenderFunction} the render function
     */
    getRenderFunction(): MapboxGeocoderRenderFunction;
    /**
     * Set the language to use in UI elements and when making search requests
     *
     * Look first at the explicitly set options otherwise use the browser's language settings
     * @param {string} [language] Specify the language to use for response text and query result weighting. Options are IETF language tags comprised of a mandatory ISO 639-1 language code and optionally one or more IETF subtags for country or script. More than one value can also be specified, separated by commas.
     * @returns {MapboxGeocoder} this
     */
    setLanguage(language?: string): MapboxGeocoder;
    /**
     * Get the language to use in UI elements and when making search requests
     * @returns {string} The language(s) used by the plugin, if any
     */
    getLanguage(): string;
    /**
     * Get the zoom level the map will move to when there is no bounding box on the selected result
     * @returns {number} the map zoom
     */
    getZoom(): number;
    /**
     * Set the zoom level
     * @param {number} zoom The zoom level that the map should animate to when a `bbox` isn't found in the response. If a `bbox` is found the map will fit to the `bbox`.
     * @returns {MapboxGeocoder} this
     */
    setZoom(zoom: number): MapboxGeocoder;
    /**
     * Get the parameters used to fly to the selected response, if any
     * @returns {boolean | object} The `flyTo` option
     */
    getFlyTo(): boolean | object;
    /**
     * Set the flyTo options
     * @param {boolean | object} flyTo If false, animating the map to a selected result is disabled. If true, animating the map will use the default animation parameters. If an object, it will be passed as `options` to the map [`flyTo`](https://docs.mapbox.com/mapbox-gl-js/api/#map#flyto) or [`fitBounds`](https://docs.mapbox.com/mapbox-gl-js/api/#map#fitbounds) method providing control over the animation of the transition.
     * @returns {MapboxGeocoder} this
     */
    setFlyTo(flyTo: boolean | object): MapboxGeocoder;
    /**
     * Get the value of the placeholder string
     * @returns {string} The input element's placeholder value
     */
    getPlaceholder(): string;
    /**
     * Set the value of the input element's placeholder
     * @param {string} [placeholder] the text to use as the input element's placeholder
     * @returns {MapboxGeocoder} this
     */
    setPlaceholder(placeholder?: string): MapboxGeocoder;
    /**
     * Get the bounding box used by the plugin
     * @returns {[number, number, number, number] | undefined} the bounding box, if any
     */
    getBbox(): [number, number, number, number] | undefined;
    /**
     * Set the bounding box to limit search results to
     * @param {[number, number, number, number]} bbox a bounding box given as an array in the format [minX, minY, maxX, maxY].
     * @returns {MapboxGeocoder} this
     */
    setBbox(bbox: [number, number, number, number]): MapboxGeocoder;
    /**
     * Get a list of the countries to limit search results to
     * @returns {string} a comma separated list of countries to limit to, if any
     */
    getCountries(): string;
    /**
     * Set the countries to limit search results to
     * @param {string} countries a comma separated list of countries to limit to
     * @returns {MapboxGeocoder} this
     */
    setCountries(countries: string): MapboxGeocoder;
    /**
     * Get a list of the types to limit search results to
     * @returns {string} a comma separated list of types to limit to
     */
    getTypes(): string;
    /**
     * Set the types to limit search results to
     * @param {string} types a comma separated list of types to limit to
     * @returns {MapboxGeocoder} this
     */
    setTypes(types: string): MapboxGeocoder;
    /**
     * Get the minimum number of characters typed to trigger results used in the plugin
     * @returns {number} The minimum length in characters before a search is triggered
     */
    getMinLength(): number;
    /**
     * Set the minimum number of characters typed to trigger results used by the plugin
     * @param {number} minLength the minimum length in characters
     * @returns {MapboxGeocoder} this
     */
    setMinLength(minLength: number): MapboxGeocoder;
    /**
     * Get the limit value for the number of results to display used by the plugin
     * @returns {number} The limit value for the number of results to display used by the plugin
     */
    getLimit(): number;
    /**
     * Set the limit value for the number of results to display used by the plugin
     * @param {number} limit the number of search results to return
     * @returns {MapboxGeocoder} this
     */
    setLimit(limit: number): MapboxGeocoder;
    /**
     * Get the filter function used by the plugin
     * @returns {MapboxGeocoderFilterFunction} the filter function
     */
    getFilter(): MapboxGeocoderFilterFunction;
    /**
     * Set the filter function used by the plugin.
     * @param {MapboxGeocoderFilterFunction} filter A function which accepts a Feature in the [extended GeoJSON](https://docs.mapbox.com/api/search/geocoding-v5/#geocoding-response-object) format to filter out results from the Geocoding API response before they are included in the suggestions list. Return `true` to keep the item, `false` otherwise.
     * @returns {MapboxGeocoder} this
     */
    setFilter(filter: MapboxGeocoderFilterFunction): MapboxGeocoder;
    /**
     * Set the geocoding endpoint used by the plugin.
     * @param {string} origin The HTTPS URL to use as the geocoding endpoint.
     * @returns {MapboxGeocoder} this
     */
    setOrigin(origin: string): MapboxGeocoder;
    /**
     * Get the geocoding endpoint the plugin is currently set to
     * @returns {string} the endpoint URL
     */
    getOrigin(): string;
    /**
     * Set the accessToken option used for the geocoding request endpoint.
     * @param {string} accessToken value
     * @returns {MapboxGeocoder} this
     */
    setAccessToken(accessToken: string): MapboxGeocoder;
    /**
     * Set the autocomplete option used for geocoding requests
     * @param {boolean} value The boolean value to set autocomplete to
     * @returns {MapboxGeocoder} this
     */
    setAutocomplete(value: boolean): MapboxGeocoder;
    /**
     * Get the current autocomplete parameter value used for requests
     * @returns {boolean} The autocomplete parameter value
     */
    getAutocomplete(): boolean;
    /**
     * Set the fuzzyMatch option used for approximate matching in geocoding requests
     * @param {boolean} value The boolean value to set fuzzyMatch to
     * @returns {MapboxGeocoder} this
     */
    setFuzzyMatch(value: boolean): MapboxGeocoder;
    /**
     * Get the current fuzzyMatch parameter value used for requests
     * @returns {boolean} The fuzzyMatch parameter value
     */
    getFuzzyMatch(): boolean;
    /**
     * Set the routing parameter used to ask for routable point metadata in geocoding requests
     * @param {boolean} value The boolean value to set routing to
     * @returns {MapboxGeocoder} this
     */
    setRouting(value: boolean): MapboxGeocoder;
    /**
     * Get the current routing parameter value used for requests
     * @returns {boolean} The routing parameter value
     */
    getRouting(): boolean;
    /**
     * Set the worldview parameter
     * @param {string} code The country code representing the worldview (e.g. "us" | "cn" | "jp", "in")
     * @returns {MapboxGeocoder} this
     */
    setWorldview(code: string): MapboxGeocoder;
    /**
     * Get the current worldview parameter value used for requests
     * @returns {string} The worldview parameter value
     */
    getWorldview(): string;
    /**
     * Handle the removal of a result marker
     * @private
     */
    private _removeMarker;
    /**
     * @overload
     * @param {'loading'} type
     * @param {(event: MapboxGeocoderLoadingEvent) => void} fn
     * @returns {MapboxGeocoder}
     */
    on(type: "loading", fn: (event: MapboxGeocoderLoadingEvent) => void): MapboxGeocoder;
    /**
     * @overload
     * @param {'results'} type
     * @param {(event: MapboxGeocoderResultsEvent) => void} fn
     * @returns {MapboxGeocoder}
     */
    on(type: "results", fn: (event: MapboxGeocoderResultsEvent) => void): MapboxGeocoder;
    /**
     * @overload
     * @param {'result'} type
     * @param {(event: MapboxGeocoderResultEvent) => void} fn
     * @returns {MapboxGeocoder}
     */
    on(type: "result", fn: (event: MapboxGeocoderResultEvent) => void): MapboxGeocoder;
    /**
     * @overload
     * @param {'error'} type
     * @param {(event: MapboxGeocoderErrorEvent) => void} fn
     * @returns {MapboxGeocoder}
     */
    on(type: "error", fn: (event: MapboxGeocoderErrorEvent) => void): MapboxGeocoder;
    /**
     * @overload
     * @param {'clear'} type
     * @param {() => void} fn
     * @returns {MapboxGeocoder}
     */
    on(type: "clear", fn: () => void): MapboxGeocoder;
    /**
     * @overload
     * @param {'loading'} type
     * @param {(event: MapboxGeocoderLoadingEvent) => void} fn
     * @returns {MapboxGeocoder}
     */
    off(type: "loading", fn: (event: MapboxGeocoderLoadingEvent) => void): MapboxGeocoder;
    /**
     * @overload
     * @param {'results'} type
     * @param {(event: MapboxGeocoderResultsEvent) => void} fn
     * @returns {MapboxGeocoder}
     */
    off(type: "results", fn: (event: MapboxGeocoderResultsEvent) => void): MapboxGeocoder;
    /**
     * @overload
     * @param {'result'} type
     * @param {(event: MapboxGeocoderResultEvent) => void} fn
     * @returns {MapboxGeocoder}
     */
    off(type: "result", fn: (event: MapboxGeocoderResultEvent) => void): MapboxGeocoder;
    /**
     * @overload
     * @param {'error'} type
     * @param {(event: MapboxGeocoderErrorEvent) => void} fn
     * @returns {MapboxGeocoder}
     */
    off(type: "error", fn: (event: MapboxGeocoderErrorEvent) => void): MapboxGeocoder;
    /**
     * @overload
     * @param {'clear'} type
     * @param {() => void} fn
     * @returns {MapboxGeocoder}
     */
    off(type: "clear", fn: () => void): MapboxGeocoder;
}
declare namespace MapboxGeocoder {
    export { MapboxGeocoderFeature, MapboxGeocoderProximity, MapboxGeocoderFilterFunction, MapboxGeocoderLocalGeocoderFunction, MapboxGeocoderExternalGeocoderFunction, MapboxGeocoderRenderFunction, MapboxGeocoderGetItemValueFunction, MapboxGeocoderOptions, MapboxGeocoderLoadingEvent, MapboxGeocoderResultsEvent, MapboxGeocoderResultEvent, MapboxGeocoderErrorEvent };
}
import EventEmitter_1 = require("events");
import EventEmitter = EventEmitter_1.EventEmitter;
import Geolocation = require("./geolocation");
import MapboxEventManager = require("./events");
type MapboxGeocoderFeature = {
    id: string;
    place_name: string;
    place_type: string[];
    text: string;
    address?: string;
    center: [number, number];
    bbox?: [number, number, number, number];
    relevance: number;
    geometry: {
        type: string;
        coordinates: [number, number];
    };
    context?: Array<{
        id: string;
        text: string;
    }>;
    properties?: object;
    matching_text?: string;
    matching_place_name?: string;
    _source?: string;
    user_coordinates?: [number, number];
};
type MapboxGeocoderProximity = {
    longitude: number;
    latitude: number;
};
type MapboxGeocoderFilterFunction = (feature: MapboxGeocoderFeature) => boolean;
type MapboxGeocoderLocalGeocoderFunction = (query: string) => MapboxGeocoderFeature[];
type MapboxGeocoderExternalGeocoderFunction = (query: string, features: MapboxGeocoderFeature[]) => Promise<MapboxGeocoderFeature[]>;
type MapboxGeocoderRenderFunction = (feature: MapboxGeocoderFeature) => string;
type MapboxGeocoderGetItemValueFunction = (feature: MapboxGeocoderFeature) => string;
type MapboxGeocoderOptions = {
    /**
     * Required. A Mapbox access token.
     */
    accessToken: string;
    /**
     * Use to set a custom API origin.
     */
    origin?: string;
    /**
     * A mapbox-gl instance to use when creating Markers.
     */
    mapboxgl?: typeof mapboxgl | null;
    /**
     * On geocoded result what zoom level should the map animate to.
     */
    zoom?: number;
    /**
     * If false, animating the map to a selected result is disabled.
     */
    flyTo?: boolean | object;
    /**
     * Override the default placeholder attribute value.
     */
    placeholder?: string;
    /**
     * A geographical point for biasing results.
     */
    proximity?: MapboxGeocoderProximity | "ip";
    /**
     * If true, proximity dynamically updates based on the map view.
     */
    trackProximity?: boolean;
    /**
     * If true, the geocoder control will collapse until hovered or in focus.
     */
    collapsed?: boolean;
    /**
     * If true, the geocoder clears and blurs on Escape.
     */
    clearAndBlurOnEsc?: boolean;
    /**
     * If true, the geocoder clears its value on blur.
     */
    clearOnBlur?: boolean;
    /**
     * A bounding box as [minX, minY, maxX, maxY].
     */
    bbox?: [number, number, number, number];
    /**
     * A comma separated list of country codes.
     */
    countries?: string;
    /**
     * A comma separated list of types to filter results.
     */
    types?: string;
    /**
     * Minimum number of characters to trigger results.
     */
    minLength?: number;
    /**
     * Maximum number of results to show.
     */
    limit?: number;
    /**
     * IETF language tag(s) for response text and weighting.
     */
    language?: string;
    /**
     * A function to filter results before display.
     */
    filter?: MapboxGeocoderFilterFunction;
    /**
     * A function for local geocoding.
     */
    localGeocoder?: MapboxGeocoderLocalGeocoderFunction;
    /**
     * A function for external geocoding.
     */
    externalGeocoder?: MapboxGeocoderExternalGeocoderFunction;
    /**
     * Factors for sorting nearby results.
     */
    reverseMode?: "distance" | "score";
    /**
     * If true, enable reverse geocoding mode.
     */
    reverseGeocode?: boolean;
    /**
     * If true, reverse geocoding uses lon,lat instead of lat,lon.
     */
    flipCoordinates?: boolean;
    /**
     * Allow Mapbox to collect anonymous usage statistics.
     */
    enableEventLogging?: boolean;
    /**
     * If true, a Marker is added at the result location.
     */
    marker?: boolean | import("mapbox-gl").MarkerOptions;
    /**
     * A function to render results in the dropdown.
     */
    render?: MapboxGeocoderRenderFunction;
    /**
     * A function to render the selected result in the search bar.
     */
    getItemValue?: MapboxGeocoderGetItemValueFunction;
    /**
     * The geocoding endpoint to query.
     */
    mode?: string;
    /**
     * If true, only localGeocoder results are returned.
     */
    localGeocoderOnly?: boolean;
    /**
     * Whether to return autocomplete results.
     */
    autocomplete?: boolean;
    /**
     * Whether to attempt approximate matching.
     */
    fuzzyMatch?: boolean;
    /**
     * Whether to request navigation metadata.
     */
    routing?: boolean;
    /**
     * Filter results by worldview.
     */
    worldview?: string;
    /**
     * If true, enable user geolocation feature.
     */
    enableGeolocation?: boolean;
    /**
     * If true, use browser focus for suggestions.
     */
    useBrowserFocus?: boolean;
    /**
     * Accuracy for geolocation address.
     */
    addressAccuracy?: "address" | "street" | "place" | "country";
};
type MapboxGeocoderLoadingEvent = {
    query: string;
};
type MapboxGeocoderResultsEvent = {
    features: MapboxGeocoderFeature[];
    type?: string;
    request?: object;
    headers?: object;
    config?: object;
    attribution?: string;
};
type MapboxGeocoderResultEvent = {
    result: MapboxGeocoderFeature;
};
type MapboxGeocoderErrorEvent = {
    error: Error;
};
//# sourceMappingURL=index.d.ts.map