## v3.1.6
-  Resolve npm publish failure

## v3.1.5

- Reduce bundle size by removing unnecessary dependencies needed for event logging [#188](https://github.com/mapbox/mapbox-gl-geocoder/issues/188)
- Fix IE11 bug originating from event logging [#194](https://github.com/mapbox/mapbox-gl-geocoder/issues/194)

## v3.1.4

- Emit a `clear` event when the user backspaces into an empty search bar or selects all existing text and deletes it.


## v3.1.3

- Fix bug where events were logging -1 as resultIndex

## v3.1.2

- Enable interaction event logging

### v3.1.1

- [bug] Ensures proximity is passed to client [#180](https://github.com/mapbox/mapbox-gl-geocoder/pull/180)

### v3.1.0

- Makes `reverseGeocode` an option (defaults to false) [#177](https://github.com/mapbox/mapbox-gl-geocoder/pull/177)
- Fixes string parsing for multiple values passed to `countries`, `types`, and `languages` [#177](https://github.com/mapbox/mapbox-gl-geocoder/pull/177)
- More generous coordinate parsing for reverse geocodes [#177](https://github.com/mapbox/mapbox-gl-geocoder/pull/177)

### v3.0.1

- Increment version to publish public package

### v3.0.0

- Uses mapbox-sdk-js to handle the client [#175](https://github.com/mapbox/mapbox-gl-geocoder/pull/175)
- Adds support for reverse geocoding [#175](https://github.com/mapbox/mapbox-gl-geocoder/pull/175)
- Supports custom origin [#175](https://github.com/mapbox/mapbox-gl-geocoder/pull/175)
- Adds `reverseMode` as an option for sorting results [#175](https://github.com/mapbox/mapbox-gl-geocoder/pull/175)

Breaking changes:

- `country` is now `countries` for options to pass into geocoder

### v2.3.0

- Add trackProximity option [#151](https://github.com/mapbox/mapbox-gl-geocoder/pull/151)
- Always fit to bbox if exists in Geocoding API response [#148](https://github.com/mapbox/mapbox-gl-geocoder/pull/148)

### v2.2.0

- Add filter option [#133](https://github.com/mapbox/mapbox-gl-geocoder/pull/133)
- Add localGeocoder option [#136](https://github.com/mapbox/mapbox-gl-geocoder/pull/136)
- Check for shadowRoot retargeting for keypressdown event [#134](https://github.com/mapbox/mapbox-gl-geocoder/pull/134)

### v2.1.2

- Bump suggestions version which includes:
   - [bug] prevent form submission on selecting a result from the list [#15](https://github.com/tristen/suggestions/pull/15)
   - [bug] ensure paste events open list [#17](https://github.com/tristen/suggestions/pull/17)
   - [bug] use mouseup rather than mousedown for list selection [#18](https://github.com/tristen/suggestions/pull/18)

### v2.1.1

- Adds option for language parameter [#126](https://github.com/mapbox/mapbox-gl-geocoder/pull/126).

### v2.1.0

- Different background colors for hover and active states [#110](https://github.com/mapbox/mapbox-gl-geocoder/pull/110)
- Add limit and minLength options [#103](https://github.com/mapbox/mapbox-gl-geocoder/pull/103)
- Add query parameter to loading event [#102](https://github.com/mapbox/mapbox-gl-geocoder/pull/102)
- Add automatic deployment to s3 [#100](https://github.com/mapbox/mapbox-gl-geocoder/pull/100)
- Move package to @mapbox namespace [#90](https://github.com/mapbox/mapbox-gl-geocoder/pull/90)
- Various bug and documentation fixes

### v2.0.1

- Add `.onRemove` method to be used by the Mapbox GL JS [IControl API](https://www.mapbox.com/mapbox-gl-js/api/#IControl#onRemove)

### v2.0.0

- Support for the Mapbox GL JS 0.27.0 API. This is compatible with 0.27.0
  and later, and not compatible with earlier versions.

Breaking changes:

- `setInput` and `query` methods no longer accept a `[lng, lat]` array. If you'd
  like to search for a location and you have that data as `[lng, lat]`, call
  `.join()` on the array before passing it to the geocoder control.
- `container` option removed - attaching the control outside of the map is no longer supported
- `position` option removed - the `addControl` method now specifies the position
- `proximity` option is now specified as a `{ longitude, latitude }` object instead of a two-element array
- Other geocoder options match the API of the Mapbox JavaScript SDK
- `.fire` method removed
- Now exports `MapboxGeocoder` rather than attaches to `mapbox.Geocoder`

### v1.3.2

- Eliminate reliance on mapboxgl.util in preparation for [mapbox-gl-js#1408](https://github.com/mapbox/mapbox-gl-js/issues/1408)
- Fix debounce timing bug (https://github.com/mapbox/mapbox-gl-geocoder/issues/64)
- Provide reasonable exceptions to country bboxes when `flyTo=true`

### v1.3.1

- [BUG] Bump `suggestions@v1.3.1` to fix lagged results [#48](https://github.com/mapbox/mapbox-gl-geocoder/issues/48)
minified library.
- [BUG] Fix mapboxgl check [#53](https://github.com/mapbox/mapbox-gl-geocoder/issues/53)

### v1.3.0

- [FEATURE] Add option `bbox` to limit suggestions to a given bounds. [#43](https://github.com/mapbox/mapbox-gl-geocoder/issues/43)
- [INTERNAL] Drop [request](https://www.npmjs.com/package/request) for plain `xmlhttprequest`. This was effecting the filesize of the
minified library.

### v1.2.0

- [BUG] Broken `flyTo` animation when a country is selected. [#44](https://github.com/mapbox/mapbox-gl-geocoder/issues/44)
- [BUG] Wrap mapboxgl.utils.wrap when coordinates are passed to query method. [#45](https://github.com/mapbox/mapbox-gl-geocoder/issues/45)
- [FEATURE] Add a `results` event when geocoder returns results. [#39](https://github.com/mapbox/mapbox-gl-geocoder/issues/39)
- [FEATURE] `setInput` method to initialize input without making an API request.

### v1.1.0

- [PERFORMANCE] Swap mapbox-sdk-js out for request
- [FEATURE] Pass a custom zoom option [#33](https://github.com/mapbox/mapbox-gl-geocoder/issues/33)
- [BUG] Dont call query function when input value is empty
- [BUG] Disable geocoder on metaKey keydown event
- [BUG] Drop the poorly supported toggle method
- [BUG] Return error if mapboxgl is not included.
- [BUG] Bump suggestions pkg to support a no filter option [#36](https://github.com/mapbox/mapbox-gl-geocoder/issues/36)

### v1.0.0

- [FEATURE] Disable `map.flyTo` option [#20](https://github.com/mapbox/mapbox-gl-geocoder/issues/20)
- [FEATURE] Add placholder option to override the default [#18](https://github.com/mapbox/mapbox-gl-geocoder/issues/18)
- [BREAKING] Drop geocoder prefix from event names [#17](https://github.com/mapbox/mapbox-gl-geocoder/issues/17)
- [UI] Fix styling in IE [#25](https://github.com/mapbox/mapbox-gl-geocoder/issues/25)
- Simplify codebase and dependencies with ES5 syntax [#24](https://github.com/mapbox/mapbox-gl-geocoder/issues/24)

### v0.1.0

- [FEATURE] Add `types` and `country` to options. [#15](https://github.com/mapbox/mapbox-gl-geocoder/pull/15)
- [UI] Styled Geocoder to align better with mapbox-gl-js built-in nav control
- [BUG] Point `main` property in package.json to dist/mapbox-gl-geocoder.js
- [BUG] Remove close action on click event [#9](https://github.com/mapbox/mapbox-gl-geocoder/issues/9)
