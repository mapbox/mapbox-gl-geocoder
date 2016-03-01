## Developing

    npm install & npm start & open http://localhost:9966/example/

You'll need a [Mapbox access token](https://www.mapbox.com/help/create-api-access-token/) stored in localstorage. Set it via

    localStorage.setItem('MapboxAccessToken', '<TOKEN HERE>');

## Testing

Tests require an MapboxAccessToken env variable to be set.

    export MapboxAccessToken="YOUR ACCESS TOKEN"

Lastly, run the test command from the console:

    npm test

## Deploying

- `npm run build && npm run docs`
- Update the version key in [package.json](https://github.com/mapbox/mapbox-gl-geocoder/blob/master/package.json#L3)
- Outline changes in [CHANGELOG.md](https://github.com/mapbox/mapbox-gl-geocoder/blob/master/CHANGELOG.md)
- Commit and push
- `git tag -a vX.X.X -m 'vX.X.X'`
- `git push --tags`
- `npm publish`
- Deploy packaged plugin in [mapbox-gl-plugins](https://github.com/mapbox/mapbox-gl-plugins)
- Update version links in documentation
