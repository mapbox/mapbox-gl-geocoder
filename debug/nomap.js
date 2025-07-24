import MapboxGeocoder from "../lib";

const accessToken = window.localStorage.getItem('MapboxAccessToken');

const meta = document.createElement('meta');
meta.name = 'viewport';
meta.content = 'initial-scale=1,maximum-scale=1,user-scalable=no';
document.getElementsByTagName('head')[0].appendChild(meta);

const notMapDiv = document.body.appendChild(document.createElement('div'));
notMapDiv.style.position = 'absolute';
notMapDiv.style.top = 0;
notMapDiv.style.right = 0;
notMapDiv.style.left = 0;
notMapDiv.style.bottom = 0;
notMapDiv.style.backgroundColor = 'darkcyan';

notMapDiv.classList.add("notAMap");

const geocoder = new MapboxGeocoder({
  accessToken,
  trackProximity: true
});

geocoder.addTo('.notAMap')

window.geocoder = geocoder;

geocoder.on('results', function(e) {
  console.log('results: ', e.features);
});

geocoder.on('result', function(e) {
  console.log('result: ', e.result);
});

geocoder.on('clear', function(e) {
  console.log(e)
  console.log('clear');
});

geocoder.on('loading', function(e) {
  console.log('loading:', e.query);
});

geocoder.on('error', function(e) {
  console.log('Error is', e.error);
});
