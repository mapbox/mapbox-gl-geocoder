'use strict';
/* global mapboxgl */

require('../');
mapboxgl.accessToken = window.localStorage.getItem('MapboxAccessToken');

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v8',
  center: [-79.4512, 43.6568],
  zoom: 13
});

var geocoder = new mapboxgl.Geocoder();
var button = document.createElement('button');
button.textContent = 'click me';

map.getContainer().querySelector('.mapboxgl-ctrl-bottom-left').appendChild(button);
map.addControl(geocoder);

map.on('load', function() {
  button.addEventListener('click', function() {
    geocoder.query('Montreal Quebec');
  });
});

geocoder.on('result', getResult);

function getResult() {
  console.log('Fetched', geocoder.getResult());
  geocoder.off('result', getResult);
}

geocoder.on('error', function(e) {
  console.log('Error is', e.error);
});
