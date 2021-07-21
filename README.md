## Maplibre GL Geocoder

A geocoder control for [maplibre-gl-js](https://github.com/maplibre/maplibre-gl-js).

### Usage

### Usage with a module bundler

```bash
npm install --save @maplibre/maplibre-gl-geocoder
```

```js
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';
...
// Functions should return Carmen GeoJSON https://github.com/mapbox/carmen/blob/master/carmen-geojson.md
// View config definitions in our [documentation](https://github.com/maplibre/maplibre-gl-geocoder/blob/master/API.md#setgeocoderapi)
var Geo = {
  forwardGeocode: async (config) => { /* definition here */ },
  reverseGeocode: async (config) => { /* definition here */ },
};

// Pass in or define a geocoding API that matches the above
const geocoder = new MaplibreGeocoder(Geo, { mapboxgl: maplibregl });

```

### Using without a Map

It is possible to use the plugin without it being placed as a control on a maplibre-gl map.

### Deeper dive

#### API Documentation

See [API.md](https://github.com/maplibre/maplibre-gl-geocoder/blob/master/API.md) for complete reference.

### Contributing

See [CONTRIBUTING.md](https://github.com/maplibre/maplibre-gl-geocoder/blob/master/CONTRIBUTING.md).
