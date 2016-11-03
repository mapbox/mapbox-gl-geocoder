### v1.3.2

- Eliminate reliance on mapboxgl.util in preparation for [mapbox-gl-js#1408](https://github.com/mapbox/mapbox-gl-js/issues/1408)

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
