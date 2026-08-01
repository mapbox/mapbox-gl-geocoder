# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A vanilla-JS geocoder control (`@mapbox/mapbox-gl-geocoder`) for `mapbox-gl-js`. It wraps the Mapbox Geocoding API (via `@mapbox/mapbox-sdk`) in a `mapboxgl.IControl`-compatible widget, backed by the `suggestions` library for the autocomplete dropdown.

## Commands

```bash
npm install && npm start        # dev server at http://localhost:9966/ (budo), serves debug/index.js
npm test                        # pretest runs eslint, then runs tests in Firefox via smokestack
npm run lint                    # eslint on lib and test
npm run docs                    # regenerate API.md from lib/index.js JSDoc via `documentation`
npm run prepublish               # build dist/mapbox-gl-geocoder.min.js via browserify + babelify + uglify
```

- Dev server requires a Mapbox access token in `localStorage`: `localStorage.setItem('MapboxAccessToken', '<TOKEN>')`.
- Tests require the `MapboxAccessToken` env var: `export MapboxAccessToken="YOUR ACCESS TOKEN"`.
- There is no single-test-file runner; `npm test` bundles `test/index.js` (which requires `test/test.geocoder.js` and `test/test.ui.js`) with browserify+envify and runs it in Firefox via smokestack. To scope down a run, temporarily comment out one of the `require(...)` lines in `test/index.js`, or use tape's `t.only`/skip individual `test(...)` blocks in the target file.
- Target runtime is browser-only (uses `document`, `window`, `navigator`, `XMLHttpRequest` directly) — code must not assume a Node environment despite CommonJS `require`/`module.exports`.

## Architecture

- `lib/index.js` — `MapboxGeocoder`, the main control. Prototype-based (`MapboxGeocoder.prototype = {...}`, not ES classes). Implements the `mapboxgl.IControl` interface (`onAdd`/`onRemove`) plus a large public getter/setter API (`setProximity`, `setLanguage`, `setFilter`, etc.) mirrored 1:1 by the `options` object passed to the constructor. Also usable standalone via `addTo()` without a map.
  - `_geocode()` is the core request pipeline: determines request type (`FORWARD` / `LOCAL` / `REVERSE`, see `GEOCODE_REQUEST_TYPE`) via `_requestType()`, builds the SDK request config via `_setupConfig()`, then merges results from three sources in order — Mapbox Geocoding API, `options.localGeocoder` (sync), `options.externalGeocoder` (async/Promise) — before applying `options.filter` and updating the `Typeahead` suggestion list.
  - `_fly()` handles map animation after a result is selected: uses `exceptions.json`-listed bounding boxes for territories that would otherwise produce absurd fit-bounds (e.g. countries spanning the antimeridian), falls back to the result's `bbox`, then to `flyTo`/`zoom`.
  - Reverse geocoding input is detected by `utils.REVERSE_GEOCODE_COORD_RGX` (`lat, lon` or, with `flipCoordinates`, `lon, lat`).
  - Geolocation flow (`_geolocateUser`) uses `lib/geolocation.js` to get the browser position, then reverse-geocodes it (unless `localGeocoderOnly`) and renders via `utils.transformFeatureToGeolocationText` with configurable `addressAccuracy`.
- `lib/events.js` — `MapboxEventManager`, sends anonymized usage telemetry (`search.start`, `search.keystroke`, `search.select`) to the Mapbox events service, batched/queued and flushed on an interval (`flush`/`push`). Disabled by `options.enableEventLogging = false` or by using a non-default `origin`/`localGeocoder`. Payloads are validated against per-event required-property lists before sending.
- `lib/utils.js` — pure helpers: coordinate regex, and feature→text transforms for reverse-geocode display.
- `lib/localization.js` — per-language placeholder text lookup, keyed by ISO 639-1 code (via `subtag`).
- `lib/exceptions.js` — bbox overrides for territories with problematic auto-fit bounds.
- `lib/mapbox-gl-geocoder.css` — control styling, published alongside `dist/`.
- `debug/` — manual browser test harness for `npm start` (`index.js`, `filter.js`, `nomap.js`, `mock-api.json`).
- `test/index.js` is the entry point that aggregates `test.geocoder.js` (core control logic, request building, options API) and `test.ui.js` (DOM/interaction behavior); `events.test.js` and `utils.test.js` cover the other two lib modules. All use `tape` + `sinon` for stubbing (e.g. stubbing `geocoderService`/`XMLHttpRequest`) and run against real DOM APIs in a real browser (no jsdom).

## Conventions

- Code style is ES5-leaning CommonJS (`var`, prototype objects, `function` expressions) even though some newer syntax (arrow functions, template literals, default params, `const`/`let`) appears in more recently touched code — match the surrounding style of whichever function you're editing rather than imposing one style repo-wide.
- Public API additions (new options or methods) should get a matching JSDoc `@param`/method comment block in `lib/index.js`, since `API.md` is generated from it via `npm run docs`.
- ESLint (`.eslintrc`) targets ES6 `parserOptions` but `sourceType: "script"` (no ESM import/export) with 2-space indentation enforced.