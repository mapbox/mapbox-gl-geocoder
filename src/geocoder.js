import MapboxClient from 'mapbox/lib/services/geocoder';
import Typeahead from 'suggestions';
import debounce from 'lodash.debounce';
import { EventEmitter } from 'events';

export default class Geocoder extends mapboxgl.Control {

  options = {
    position: 'top-left'
  }

  constructor(options) {
    super();
    this._ev = new EventEmitter();
    this.options = Object.assign({}, this.options, options);
  }

  onAdd(map) {
    this.container = this.options.container ?
      typeof this.options.container === 'string' ?
      document.getElementById(this.options.container) :
      this.options.container :
      map.getContainer();

    // Template
    const el = document.createElement('div');
    el.className = 'mapboxgl-ctrl-geocoder';

    const icon = document.createElement('span');
    icon.classList.add('geocoder-icon', 'geocoder-icon-search');

    const input = this._inputEl = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Search';

    input.addEventListener('keyup', (e) => {
      if (!e.target.value) this._clear();
    });

    input.addEventListener('keypress', debounce((e) => {
      this._queryFromInput(e.target.value);
    }), 200);

    input.addEventListener('change', () => {
      const { selected } = this._typeahead;

      if (selected) {

        if (selected.bbox) {
          const { bbox } = selected;
          map.fitBounds([[bbox[0], bbox[1]],[bbox[2], bbox[3]]]);
        } else {
          map.flyTo({ center: selected.center });
        }

        this._input = selected;
        this.fire('geocoder.input', { result: selected });
      }
    });

    const actions = document.createElement('div');
    actions.classList.add('geocoder-pin-right');

    const clear = this._clearEl = document.createElement('button');
    clear.classList.add('geocoder-icon', 'geocoder-icon-close');
    clear.addEventListener('click', this._clear.bind(this));

    const loading = this._loadingEl = document.createElement('span');
    loading.classList.add('geocoder-icon', 'geocoder-icon-loading');

    actions.appendChild(clear);
    actions.appendChild(loading);

    el.appendChild(icon);
    el.appendChild(input);
    el.appendChild(actions);

    this.container.appendChild(el);
    this.client = new MapboxClient(this.options.accessToken ?
                                   this.options.accessToken :
                                   mapboxgl.accessToken);

    // Override the control being added to control containers
    if (this.options.container) this.options.position = false;

    this._typeahead = new Typeahead(input, []);
    this._typeahead.getItemValue = function(item) { return item.place_name; };

    return el;
  }

  _geocode(q, callback) {
    this._loadingEl.classList.toggle('active', true);
    this.fire('geocoder.loading');

    const options = {};

    if (this.options.proximity) {
      options.proximity = {
        longitude: this.options.proximity[0],
        latitude: this.options.proximity[1]
      };
    }

    if (this.options.country) options.country = this.options.country;
    if (this.options.types) options.types = this.options.types;

    return this.client.geocodeForward(q.trim(), options, (err, res) => {
      this._loadingEl.classList.toggle('active', false);
      if (err) return this.fire('geocoder.error', { error: err.message });
      if (!res.features.length) this._typeahead.selected = null;
      this._typeahead.update(res.features);
      this._clearEl.classList.toggle('active', res.features.length);
      return callback(res.features);
    });
  }

  _queryFromInput(q) {
    q = q.trim();
    if (q.length > 2) {
      this._geocode(q, (results) => {
        this._results = results;
      });
    }
  }

  _change() {
    const onChange = document.createEvent('HTMLEvents');
    onChange.initEvent('change', true, false);
    this._inputEl.dispatchEvent(onChange);
  }

  _query(input) {
    if (!input) return;
    const q = (typeof input === 'string') ? input : input.join();
    this._geocode(q, (results) => {
      if (!results.length) return;
      const result = results[0];
      this._results = results;
      this._typeahead.selected = result;
      this._inputEl.value = result.place_name;
      this._change();
    });
  }

  _clear() {
    this._input = null;
    this._inputEl.value = '';
    this._typeahead.selected = null;
    this._typeahead.update([]);
    this._change();
    this._inputEl.focus();
    this._clearEl.classList.remove('active');
    this.fire('geocoder.clear');
  }

  /**
   * Return the input
   * @returns {Object} input
   */
  getResult() {
    return this._input;
  }

  /**
   * Set input
   * @param {Array|String} query An array of coordinates [lng, lat] or location name as a string.
   * @returns {Geocoder} this
   */
  query(query) {
    this._query(query);
    return this;
  }

  /**
   * Subscribe to events that happen within the plugin.
   * @param {String} type name of event. Available events and the data passed into their respective event objects are:
   * - __geocoder.clear__ `Emitted when the input is cleared`
   * - __geocoder.loading__ `Emitted when the geocoder is looking up a query`
   * - __geocoder.input__ `{ result } Fired when input is set`
   * - __geocoder.error__ `{ error } Error as string
   * @param {Function} fn function that's called when the event is emitted.
   * @returns {Geocoder} this;
   */
  on(type, fn) {
    this._ev.on(type, fn);
    return this;
  }

  /**
   * Fire an event
   * @param {String} type event name.
   * @param {Object} data event data to pass to the function subscribed.
   * @returns {Geocoder} this
   */
  fire(type, data) {
    this._ev.emit(type, data);
    return this;
  }

  /**
   * Remove an event
   * @returns {Geocoder} this
   * @param {String} type Event name.
   * @param {Function} fn Function that should unsubscribe to the event emitted.
   */
  off(type, fn) {
    this._ev.removeListener(type, fn);
    return this;
  }
}
