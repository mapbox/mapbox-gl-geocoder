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

Follow this deploy process after all changes for the release are merged into main. You will copy and paste this checklist in the comment of the release pull request.

```
## Release checklist

1. Create a branch off `main` and a pull request with the following changes. Copy this checklist in the comment of the pull request.
    - [ ] Update the [CHANGELOG.md](https://github.com/mapbox/mapbox-gl-geocoder/blob/main/CHANGELOG.md) by comparing the last release and what is on `main`. In the changelog, add the to-be-released stable version heading below `HEAD`.
    - [ ] Update the version number in `package.json` and `package-lock.json`.
    - [ ] Run `npm run docs` and commit any changes to `API.md`.
2. Request a PR review and then merge it into `main`.
3. Tag the merge commit and publish.
    - [ ] Create the git tag with `git tag -a vX.X.X -m 'vX.X.X'` on the merged commit
    - [ ] Push it with `git push origin vX.X.X`. This starts the `Publish` workflow, which publishes to npm once the `npm-release` environment is approved.
    - [ ] Create a GitHub release for the tag with the changelog entry.


## Post-release checklist

Upload to the CDN (make sure you are authenticated for AWS):

    git checkout vX.X.X
    npm ci
    aws s3 cp --recursive --acl public-read dist s3://mapbox-gl-js/plugins/mapbox-gl-geocoder/vX.X.X

Update the geocoder version in `src/components/example/helpers.js` of [mapbox-gl-js-docs](https://github.com/mapbox/mapbox-gl-js-docs).
```
