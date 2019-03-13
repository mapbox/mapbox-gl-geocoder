## Developing

    npm install & npm start & open http://localhost:9966/

You'll need a [Mapbox access token](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/) stored in localstorage. Set it via

    localStorage.setItem('MapboxAccessToken', '<TOKEN HERE>');

## Testing

Tests require an MapboxAccessToken env variable to be set.

    export MapboxAccessToken="YOUR ACCESS TOKEN"

Lastly, run the test command from the console:

    npm test


## Deploying

Follow this deploy process after all changes for the release are merged into master. You will copy and paste this checklist in the comment of the release pull request.

```
## Release checklist

1. Create a branch off `master` and a pull request with the following changes. Copy this checklist in the comment of the pull request.
    - [ ] Update the [CHANGELOG.md](https://github.com/mapbox/mapbox-gl-geocoder/blob/master/CHANGELOG.md) by comparing the last release and what is on `master`. In the changelog, replace the `master` heading with the to-be-released stable version.
    - [ ] Update the version number in `package.json` and `package.lock.json`.
3. Request a review PR and then merge it into `master`.
4. Tag the release and start the build.
    - [ ] Make sure you've pulled in all changes to `master` locally.
    - [ ] Build the release with `npm run prepublish && npm run docs`
    - [ ] Commit and push with commit message `vX.X.X`
    - [ ] Create the git tag for the release with `git tag -a vX.X.X -m 'vX.X.X'`
    - [ ] Push the tags with `git push --tags`
    - [ ] Run `npm publish`


## Post-release checklist

Update version number in GL JS examples:

* [ ] [mapbox-gl-geocoder](https://github.com/mapbox/mapbox-gl-js/blob/publisher-production/docs/pages/example/mapbox-gl-geocoder.html)
* [ ] [point-from-geocoder-result](https://github.com/mapbox/mapbox-gl-js/blob/publisher-production/docs/pages/example/point-from-geocoder-result.html)
* [ ] [mapbox-gl-geocoder-outside-the-map](https://github.com/mapbox/mapbox-gl-js/blob/publisher-production/docs/pages/example/mapbox-gl-geocoder-outside-the-map.html)
* [ ] [mapbox-gl-geocoder-limit-region](https://github.com/mapbox/mapbox-gl-js/blob/publisher-production/docs/pages/example/mapbox-gl-geocoder-limit-region.html)
* [ ] [mapbox-gl-geocoder-accept-coordinates](https://github.com/mapbox/mapbox-gl-js/blob/publisher-production/docs/pages/example/mapbox-gl-geocoder-accept-coordinates.html)
* [ ] [mapbox-gl-geocoder-proximity-bias](https://github.com/mapbox/mapbox-gl-js/blob/publisher-production/docs/pages/example/mapbox-gl-geocoder-proximity-bias.html)
* [ ] [forward-geocode-custom-data](https://github.com/mapbox/mapbox-gl-js/blob/publisher-production/docs/pages/example/forward-geocode-custom-data.html)
```
