import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '../lib';

mapboxgl.accessToken = window.localStorage.getItem('MapboxAccessToken');

const mapDiv = document.body.appendChild(document.createElement('div'));
mapDiv.style.position = 'absolute';
mapDiv.style.top = 0;
mapDiv.style.right = 0;
mapDiv.style.left = 0;
mapDiv.style.bottom = 0;

const map = new mapboxgl.Map({
  container: mapDiv,
  style: 'mapbox://styles/mapbox/streets-v9',
  center: [-79.4512, 43.6568],
  zoom: 13
});

const geocoder = new MapboxGeocoder({
  accessToken: window.localStorage.getItem('MapboxAccessToken'),
  country: 'au',
  filter: function(item) {
    // returns true if item contains New South Wales region
    return item.context
      .map(i => {
        return i.id.startsWith('region') && i.text == 'New South Wales';
      })
      .reduce((acc, cur) => {
        return acc || cur;
      });
  }
});

window.geocoder = geocoder;

const button = document.createElement('button');
button.textContent = 'click me';

const removeBtn = document.body.appendChild(document.createElement('button'));
removeBtn.style.position = 'absolute';
removeBtn.style.zIndex = 10;
removeBtn.style.top = '10px';
removeBtn.style.left = '10px';
removeBtn.textContent = 'Remove geocoder control';

map
  .getContainer()
  .querySelector('.mapboxgl-ctrl-bottom-left')
  .appendChild(button);
map.addControl(geocoder);

map.on('load', function() {
  button.addEventListener('click', function() {
    geocoder.query('Montreal Quebec');
  });
  removeBtn.addEventListener('click', function() {
    map.removeControl(geocoder);
  });
});

geocoder.on('results', function(e) {
  console.log('results: ', e.features);
});

geocoder.on('error', function(e) {
  console.log('Error is', e.error);
});
