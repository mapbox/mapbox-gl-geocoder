'use strict';
var mapboxgl = require('mapbox-gl');
mapboxgl.accessToken = window.localStorage.getItem('MapboxAccessToken');

var MapboxGeocoder = require('../');

var mapDiv = document.body.appendChild(document.createElement('div'));
mapDiv.style = 'position:absolute;top:0;right:0;left:0;bottom:0;';

var map = new mapboxgl.Map({
  container: mapDiv,
  style: 'mapbox://styles/mapbox/streets-v9',
  center: [-79.4512, 43.6568],
  zoom: 13
});

var geocoder = new MapboxGeocoder();
var button = document.createElement('button');
button.textContent = 'click me';

map.getContainer().querySelector('.mapboxgl-ctrl-bottom-left').appendChild(button);
map.addControl(geocoder);

map.on('load', function() {
  button.addEventListener('click', function() {
    geocoder.query('Montreal Quebec');
  });
});

geocoder.on('results', function(e) {
  console.log('results: ', e.results);
});

geocoder.on('error', function(e) {
  console.log('Error is', e.error);
});
