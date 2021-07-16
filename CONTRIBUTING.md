## Developing

    npm install & npm start & open http://localhost:9966/

## Testing

Lastly, run the test command from the console:

    npm test

## Deploying

Follow this deploy process after all changes for the release are merged into master. You will copy and paste this checklist in the comment of the release pull request.

```
## Release checklist

1. Create a branch off `master` and a pull request with the following changes. Copy this checklist in the comment of the pull request.
    - [ ] Update the [CHANGELOG.md](https://github.com/thaddmt/maplibre-gl-geocoder/blob/master/CHANGELOG.md) by comparing the last release and what is on `master`. In the changelog, replace the `master` heading with the to-be-released stable version.
    - [ ] Update the version number in `package.json` and `package-lock.json`.
3. Request a PR review and then merge it into `master`.
4. Tag the release and start the build.
    - [ ] Make sure you've pulled in all changes to `master` locally.
    - [ ] Build the release with `npm run prepublish && npm run docs`
    - [ ] Commit and push with commit message `vX.X.X`
    - [ ] Create the git tag for the release with `git tag -a vX.X.X -m 'vX.X.X'`
    - [ ] Push the tags with `git push --tags`
    - [ ] Run `npm publish`

```
