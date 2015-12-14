import MapboxClient from 'mapbox/lib/services/geocoder';
import Typeahead from 'suggestions';
import debounce from 'lodash.debounce';

export default class Geocoder extends mapboxgl.Control {

  options = {
    position: 'top-left',
    proximity: null
  }

  constructor(options) {
    super();
    this._ev = [];
    this.options = Object.assign(this.options, options);
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

    input.addEventListener('keypress', debounce((e) => {
      this._queryFromInput(e.target.value);
    }), 100);

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

    const options = this.options.proximity ? {
      proximity: {
        longitude: this.options.proximity[0],
        latitude: this.options.proximity[1]
      }
    } : {};

    return this.client.geocodeForward(q.trim(), options, (err, res) => {
      if (err) throw err;
      this._loadingEl.classList.toggle('active', false);
      if (!res.features.length) this._typeahead.selected = null;
      this._typeahead.update(res.features);
      this._clearEl.classList.toggle('active', res.features.length);
      return callback(res.features);
    });
  }

  _queryFromInput(q) {
    this._geocode(q, (results) => {
      this._results = results;
    });
  }

  _query(input) {
    if (!input) return;
    const q = (typeof input === 'string') ? input : input.join();
    this._geocode(q, (results) => {
      if (!results.length) return;
      const result = results[0];
      this._results = results;
      this._typeahead.selected = result;

      // Trigger inputs onChange event
      const onChange = document.createEvent('HTMLEvents');
      onChange.initEvent('change', true, false);
      this._inputEl.value = result.place_name;
      this._inputEl.dispatchEvent(onChange);
    });
  }

  _clear() {
    this._input = null;
    this._inputEl.value = '';
    this._inputEl.focus();

    this._typeahead.selected = null;
    this._typeahead.update([]);
    this.fire('geocoder.clear');
  }

  /**
   * Return the input
   * @returns {Object} input
   */
  get() {
    return this._input;
  }

  /**
   * Set input
   * @param {Array|String} query An array of coordinates [lng, lat] or location name as a string.
   * @returns {Geocoder} this
   */
  set(query) {
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
    this._ev[type] = this._ev[type] || [];
    this._ev[type].push(fn);
    return this;
  }

  /**
   * Fire an event
   * @param {String} type event name.
   * @param {Object} data event data to pass to the function subscribed.
   * @returns {Geocoder} this
   */
  fire(type, data) {
    if (!this._ev[type]) return;
    const listeners = this._ev[type].slice();
    for (var i = 0; i < listeners.length; i++) listeners[i].call(this, data);
    return this;
  }
}
