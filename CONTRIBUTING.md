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
    - [ ] Update the [CHANGELOG.md](https://github.com/mapbox/mapbox-gl-geocoder/blob/main/CHANGELOG.md) by comparing the last release and what is on `main`. In the changelog, replace the `HEAD` heading with the to-be-released stable version.
    - [ ] Update the version number in `package.json` and `package-lock.json`.
3. Request a PR review and then merge it into `main`.
4. Tag the release and start the build.
    - [ ] Make sure you've pulled in all changes to `main` locally.
    - [ ] Build the release with `npm run prepublish && npm run docs`
    - [ ] Commit and push with commit message `vX.X.X`
    - [ ] Create the git tag for the release with `git tag -a vX.X.X -m 'vX.X.X'`
    - [ ] Push the tags with `git push --tags`
    - [ ] Run `mbx npm publish`


## Post-release checklist

Update version number in GL JS examples at [https://github.com/mapbox/mapbox-gl-js-docs](https://github.com/mapbox/mapbox-gl-js-docs):

    sed -i '' 's/mapbox-gl-geocoder\/v[^\/]*\//mapbox-gl-geocoder\/vX.X.X\//g' docs/pages/example/*.html
```

## Releasing a new version

Releases are published to npm via GitHub Actions.

### Steps

1. **Bump the version** in `package.json` (follow [semver](https://semver.org))
2. **Update `CHANGELOG.md`** with a summary of what changed
3. **Open a PR**, get it reviewed and merged to `main`
4. **Trigger the release** from the [Actions tab](../../actions/workflows/npm-release.yml):
   - Select **NPM release** → **Run workflow** → run from `main`

The workflow will publish to npm and create a GitHub release with auto-generated notes.

> **Note:** Only Mapbox maintainers with write access to this repository can trigger the release workflow. External contributors can open and contribute to PRs, but releases are always cut by the owning team.
