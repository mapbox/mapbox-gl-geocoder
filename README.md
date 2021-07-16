## Maplibre GL Geocoder

A geocoder control for [maplibre-gl-js](https://github.com/maplibre/maplibre-gl-js).

### Usage

- https://docs.mapbox.com/mapbox-gl-js/example/mapbox-gl-geocoder/
- https://docs.mapbox.com/mapbox-gl-js/example/?search=mapbox-gl-geocoder

**If you are supporting older browsers, you will need to use a polyfill.** We recommend working with [@babel/polyfill](https://babeljs.io/docs/en/babel-polyfill).

### Usage with a module bundler

```bash
npm install --save @maplibre/maplibre-gl-geocoder
```

```js
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
import '@maplibre/maplibre-gl-geocoder/dist/mapbox-gl-geocoder.css';
...
// Functions should return Carmen GeoJSON https://github.com/mapbox/carmen/blob/master/carmen-geojson.md
var Geo = {
  forwardGeocode: async () => { /* definition here */ },
  reverseGeocode: async () => { /* definition here */ },
};

// Pass in or define a geocoding API that matches the above
const geocoder = new MaplibreGeocoder(Geo, { mapboxgl: maplibregl });

```

### Using without a Map

It is possible to use the plugin without it being placed as a control on a mapbox-gl map. Keep in mind that the Mapbox [Terms of Service](https://www.mapbox.com/legal/tos#[GAGA]) require that POI search results be shown on a Mapbox map. If you don't need POIs, you can exclude them from your search results with the `options.types` parameter when constructing a new Geocoder.

### Deeper dive

#### API Documentation

See [API.md](https://github.com/mapbox/mapbox-gl-geocoder/blob/master/API.md) for complete reference.

#### Examples

See [https://docs.mapbox.com/mapbox-gl-js/examples/#geocoder](https://docs.mapbox.com/mapbox-gl-js/examples/#geocoder).

### Contributing

See [CONTRIBUTING.md](https://github.com/mapbox/mapbox-gl-geocoder/blob/master/CONTRIBUTING.md).
