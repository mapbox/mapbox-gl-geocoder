Mapbox GL Geocoder [![CircleCI](https://circleci.com/gh/mapbox/mapbox-gl-geocoder.svg?style=svg)](https://circleci.com/gh/mapbox/mapbox-gl-geocoder)
---

A geocoder control for [mapbox-gl-js](https://github.com/mapbox/mapbox-gl-js) using the [Mapbox Geocoding API](https://www.mapbox.com/api-documentation/#geocoding).

### Usage

https://www.mapbox.com/mapbox-gl-js/example/mapbox-gl-geocoder/

### Usage with a module bundler

This module exports a single class called MapboxGeocoder as its default export,
so in browserify or webpack, you can require it like:

```js
var MapboxGeocoder = require('@mapbox/mapbox-gl-geocoder');
```

### Deeper dive

#### API Documentation

See [API.md](https://github.com/mapbox/mapbox-gl-geocoder/blob/master/API.md) for complete reference.

#### Examples

 - [Add a geocoder to Mapbox GL JS](https://www.mapbox.com/mapbox-gl-js/example/mapbox-gl-geocoder/)
 - [Place the geocoder input outside the map](https://www.mapbox.com/mapbox-gl-js/example/mapbox-gl-geocoder-outside-the-map/)
 - [Limit geocoder results to a named region](https://www.mapbox.com/mapbox-gl-js/example/mapbox-gl-geocoder-limit-region/)
 - [Supplement geocoding search results from another data source](https://www.mapbox.com/mapbox-gl-js/example/mapbox-gl-geocoder-local-geocoder)
 - [Bias geocoder results around the map view](https://www.mapbox.com/mapbox-gl-js/example/mapbox-gl-geocoder-proximity-bias)

### Contributing

See [CONTRIBUTING.md](https://github.com/mapbox/mapbox-gl-geocoder/blob/master/CONTRIBUTING.md).
