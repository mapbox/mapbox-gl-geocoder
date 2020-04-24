Mapbox GL Geocoder [![Build Status](https://travis-ci.com/mapbox/mapbox-gl-geocoder.svg?branch=master)](https://travis-ci.com/mapbox/mapbox-gl-geocoder)
---

A geocoder control for [mapbox-gl-js](https://github.com/mapbox/mapbox-gl-js) using the [Mapbox Geocoding API](https://docs.mapbox.com/api/search/#geocoding). For a JavaScript geocoder without a graphical user interface see the [Mapbox SDK for JS](https://github.com/mapbox/mapbox-sdk-js/blob/master/docs/services.md#geocoding).

### Usage

https://www.mapbox.com/mapbox-gl-js/example/mapbox-gl-geocoder/

**If you are supporting older browsers, you will need a Promise polyfill.**
[es6-promise](https://github.com/stefanpenner/es6-promise) is a good one, if you're uncertain.

### Usage with a module bundler

This module exports a single class called MapboxGeocoder as its default export,
so in browserify or webpack, you can require it like:

```js
var MapboxGeocoder = require('@mapbox/mapbox-gl-geocoder');
```

###  Using without a Map
It is possible to use the plugin without it being placed as a control on a mapbox-gl map. Keep in mind that the Mapbox [Terms of Service](https://www.mapbox.com/legal/tos#[GAGA]) require that POI search results be shown on a Mapbox map. If you don't need POIs, you can exclude them from your search results with the `options.types` parameter  when constructing a new Geocoder. 

### Deeper dive

#### API Documentation

See [API.md](https://github.com/mapbox/mapbox-gl-geocoder/blob/master/API.md) for complete reference.

#### Examples

 - [Add a geocoder to Mapbox GL JS](https://www.mapbox.com/mapbox-gl-js/example/mapbox-gl-geocoder/)
 - [Place the geocoder input outside the map](https://www.mapbox.com/mapbox-gl-js/example/mapbox-gl-geocoder-outside-the-map/)
 - [Limit geocoder results to a named region](https://www.mapbox.com/mapbox-gl-js/example/mapbox-gl-geocoder-limit-region/)
 - [Supplement geocoding search results from another data source](https://www.mapbox.com/mapbox-gl-js/example/forward-geocode-custom-data/)
 - [Accept coordinates as input to a geocoder](https://www.mapbox.com/mapbox-gl-js/example/mapbox-gl-geocoder-accept-coordinates/)

### Contributing

See [CONTRIBUTING.md](https://github.com/mapbox/mapbox-gl-geocoder/blob/master/CONTRIBUTING.md).
