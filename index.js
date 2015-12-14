/**
 * A geocoder component using Mapbox Geocoding APi
 * @class mapboxgl.Geocoder
 *
 * @param {Object} options
 * @param {String} [options.position="top-right"] A string indicating the control's position on the map. Options are `top-right`, `top-left`, `bottom-right`, `bottom-left`
 * @param {String} [options.accessToken=null] Required unless `mapboxgl.accessToken` is set globally
 * @param {string|element} options.container html element to initialize the map in (or element id as string). if no container is passed map.getcontainer() is used instead.
 * @param {Array<Array<number>>} options.proximity If set, search results closer to these coordinates will be given higher priority.
 * @example
 * var geocoder = new mapboxgl.Geocoder();
 * map.addControl(geocoder);
 * @return {Geocoder} `this`
 */
import Geocoder from './src/geocoder';

if (window.mapboxgl) {
  mapboxgl.Geocoder = Geocoder;
} else if (typeof module !== 'undefined') {
  module.exports = Geocoder;
}
