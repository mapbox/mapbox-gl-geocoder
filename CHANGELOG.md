## master

## 4.7.2

### Bug fixes 🐛

- Prevents interpretation of forward geocoding requests as reverse geocoding requests [#424](https://github.com/mapbox/mapbox-gl-geocoder/pull/424)

## 4.7.1

### Features / Improvements 🚀

- Added russian placeholder [#409](https://github.com/mapbox/mapbox-gl-geocoder/pull/409)

### Bug fixes 🐛

- Fixed an error in the demo when no results are found [#391](https://github.com/mapbox/mapbox-gl-geocoder/pull/391)
- Fixed `setMinLength` to correctly apply the `minLength` property to the typeahead [#399](https://github.com/mapbox/mapbox-gl-geocoder/pull/399)
- Updated the `mapbox-gl` peerDependency to work with GL JS 2 [#413](https://github.com/mapbox/mapbox-gl-geocoder/pull/413)

## 4.7.0

### Features / Improvements 🚀

- Added option for a promise based externalGeocoder [#385](https://github.com/mapbox/mapbox-gl-geocoder/pull/385)

## 4.6.0

### Features / Improvements 🚀

- Support passing an `HTMLElement` as the container [#311](https://github.com/mapbox/mapbox-gl-geocoder/pull/311)

### Bug fixes 🐛

- Disable `proximity` option when `reverseGeocode` is enabled since it is not supported by the Mapbox Geocoding API [#327](https://github.com/mapbox/mapbox-gl-geocoder/pull/327)
- Fixed the display of SVG icons in IE11 [#341](https://github.com/mapbox/mapbox-gl-geocoder/pull/341)
- Removed an escape character from the CSS which caused issues importing into a SASS file [#343](https://github.com/mapbox/mapbox-gl-geocoder/pull/343)
- Fixed a bug where `results` event was not being triggered on `setInput`, by ensuring `setInput` behaves in the same manner as a `keyDown` event, returning suggestions based on the input [#345](https://github.com/mapbox/mapbox-gl-geocoder/pull/345)
- Fix a bug where the geocoder did not work when used on a map inititalized or viewed at a latitude or longitude of 0 [#350](https://github.com/mapbox/mapbox-gl-geocoder/pull/350)

## v4.5.1

### Bug fixes 🐛

- Fix a bug where geocoding responses without a center would try to add a Marker [#301](https://github.com/mapbox/mapbox-gl-geocoder/pull/301)
- Fix a bug where result was not selected on subsequent `localGeocoder` searches [#315](https://github.com/mapbox/mapbox-gl-geocoder/pull/315)

### Features / Improvements 🚀

- Added Persian translation for `placeholder` [#322](https://github.com/mapbox/mapbox-gl-geocoder/pull/322)

## v4.5.0

### Features / Improvements 🚀

- Supports adding a geocoder to an arbitrary HTML element so it can be used without a map [#270](https://github.com/mapbox/mapbox-gl-geocoder/issues/270).

### Bug fixes 🐛

- Fix event deduplication [#298](https://github.com/mapbox/mapbox-gl-geocoder/pull/298).
- Add a paste event handler to ensure that paste events are recognized by the geocoder and trigger searches [#300](https://github.com/mapbox/mapbox-gl-geocoder/pull/300).

## v4.4.2

### Features / Improvements 🚀

- Adds `getOrigin` and `setOrigin` for alternative geocoding endpoints.
- Adds `request` and `headers` to geocoding response object for endpoint swap testing.

## v4.4.1

### Bug fixes 🐛

- Specify version range of `mapbox-gl` in `peerDependencies`. [#285](https://github.com/mapbox/mapbox-gl-geocoder/pull/285).

## v4.4.0

### Features / Improvements 🚀

- Adds a `localGeocoderOnly` mode that allows queries against a `localGeocoder` without making calls to the Mapbox search API. [#275](https://github.com/mapbox/mapbox-gl-geocoder/issues/275).

## v4.3.0

### Features / Improvements 🚀

- Add an option to use the `mapbox.places-permanent` geocoding endpoint (requires an enterprise license). For more details on `mapbox.places-permanent` see https://docs.mapbox.com/api/search/#mapboxplaces-permanent. (#272)

## v4.2.0

### Features / Improvements 🚀

- Render an error message when a search was unsuccessful (#231)
- Render an error message when a search returned no results (#232)

## v4.1.2

### Bug fixes 🐛

- Fix issue where selection events are logged with the incorrect `queryString` value. [#262](https://github.com/mapbox/mapbox-gl-geocoder/pull/262)

## v4.1.0

### Bug fixes 🐛

- Fix issue with blur event handlers that prevented search input from collapsing on blur if both `clearOnBlur` and `collapsed` options are set to true [#257](https://github.com/mapbox/mapbox-gl-geocoder/issues/257).

## v4.1.0

### Features / Improvements 🚀
- Add `clearAndBlurOnEsc` option to geocoder [#240](https://github.com/mapbox/mapbox-gl-geocoder/issues/240)
- Adds `clearOnBlur` option to clear geocoder input on blur [#240](https://github.com/mapbox/mapbox-gl-geocoder/issues/240)

### Bug Fixes 🐛
* Fix CSS issue where close button was not being centered [#241](https://github.com/mapbox/mapbox-gl-geocoder/issues/241)
* Namespace all CSS to prevent collisions  [#248](https://github.com/mapbox/mapbox-gl-geocoder/issues/248)
* Fix CSS issue with width on input when `collapsed` enabled [#238](https://github.com/mapbox/mapbox-gl-geocoder/issues/238)

## v4.0.0

### Breaking Changes ⚠️
- Support for the Mapbox GL JS 0.47.0 API. This is compatible with 0.47.0 and later, and may not be compatible with earlier versions [#219](https://github.com/mapbox/mapbox-gl-geocoder/pull/219).
- Obtain language from user's browser settings [#195](https://github.com/mapbox/mapbox-gl-geocoder/issues/195)
- Localize placeholder based on language set in constructor options [#150](https://github.com/mapbox/mapbox-gl-geocoder/issues/150)
- `trackProximity` turned on by default [#195](https://github.com/mapbox/mapbox-gl-geocoder/issues/195)

### Features / Improvements 🚀
- Mapbox events upgraded to v0.2.0 for better handling [#212](https://github.com/mapbox/mapbox-gl-geocoder/pull/212)
- Pass `flyTo` options to the map on result selection on both map#flyTo and map#fitBounds operations [#214](https://github.com/mapbox/mapbox-gl-geocoder/pull/214)  and [#227](https://github.com/mapbox/mapbox-gl-geocoder/pull/227)
- Bump `suggestions` dependency to v1.4.x
- Adds the `marker` constructor option that allows adding the selected result to the map as a [marker](https://docs.mapbox.com/mapbox-gl-js/api/#marker). Adding the marker to the map is now the default behavior. [#219](https://github.com/mapbox/mapbox-gl-geocoder/pull/219).
- Add `get` and `set` methods for constructor options [#226](https://github.com/mapbox/mapbox-gl-geocoder/pull/226)
- Add `collapsed` option to collapse the geocoder controller into a button until hovered or focused [#222](https://github.com/mapbox/mapbox-gl-geocoder/issues/222)
- Expose `clear` as public method [#115](https://github.com/mapbox/mapbox-gl-geocoder/issues/115)

### Bug Fixes 🐛
- Upgrade dev dependencies [#216](https://github.com/mapbox/mapbox-gl-geocoder/pull/216)
- Remove hardcoded IDs in bounding box exception list [#217](https://github.com/mapbox/mapbox-gl-geocoder/pull/217)
- Fix double map `moveend` event [#229](https://github.com/mapbox/mapbox-gl-geocoder/pull/229)
- Fix duplicate `result` event bug [#218](https://github.com/mapbox/mapbox-gl-geocoder/pull/218)
- Fix trapped focus bug [#220](https://github.com/mapbox/mapbox-gl-geocoder/issues/220)

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
