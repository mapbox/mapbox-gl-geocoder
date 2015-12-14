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

map.on('load', () => {
  button.addEventListener('click', function() {
    geocoder.set('Montreal Quebec');
  });
});

geocoder.on('geocoder.input', function() {
  var result = geocoder.get();
  console.log('Fetched', result);
});
