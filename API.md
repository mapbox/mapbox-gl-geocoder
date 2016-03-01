# fire

Fire an event

**Parameters**

-   `type` **String** event name.
-   `data` **Object** event data to pass to the function subscribed.

Returns **Geocoder** this

# getResult

Return the input

Returns **Object** input

# mapboxgl.Geocoder

A geocoder component using Mapbox Geocoding APi

**Parameters**

-   `options` **Object** 
    -   `options.position` **[String]** A string indicating the control's position on the map. Options are `top-right`, `top-left`, `bottom-right`, `bottom-left` (optional, default `"top-right"`)
    -   `options.accessToken` **[String]** Required unless `mapboxgl.accessToken` is set globally (optional, default `null`)
    -   `options.container` **string or element** html element to initialize the map in (or element id as string). if no container is passed map.getcontainer() is used instead.
    -   `options.proximity` **Array&lt;Array&lt;number&gt;&gt;** If set, search results closer to these coordinates will be given higher priority.
    -   `options.flyTo` **[Boolean]** If false, animating the map to a selected result is disabled. (optional, default `true`)
    -   `options.placeholder` **[String]** Override the default placeholder attribute value. (optional, default `"Search"`)
    -   `options.types` **string** a comma seperated list of types that filter results to match those specified. See <https://www.mapbox.com/developers/api/geocoding/#filter-type> for available types.
    -   `options.country` **string** a comma seperated list of country codes to limit results to specified country or countries.

**Examples**

```javascript
var geocoder = new mapboxgl.Geocoder();
map.addControl(geocoder);
```

Returns **Geocoder** `this`

# off

Remove an event

**Parameters**

-   `type` **String** Event name.
-   `fn` **Function** Function that should unsubscribe to the event emitted.

Returns **Geocoder** this

# on

Subscribe to events that happen within the plugin.

**Parameters**

-   `type` **String** name of event. Available events and the data passed into their respective event objects are:-   **clear** `Emitted when the input is cleared`
    -   **loading** `Emitted when the geocoder is looking up a query`
    -   **result** `{ result } Fired when input is set`
    -   **error** `{ error } Error as string
-   `fn` **Function** function that's called when the event is emitted.

Returns **Geocoder** this;

# query

Set input

**Parameters**

-   `query` **Array or String** An array of coordinates [lng, lat] or location name as a string.

Returns **Geocoder** this
