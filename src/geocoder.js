import { createStore, applyMiddleware, bindActionCreators } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';
import assign from 'lodash.assign';

const storeWithMiddleware = applyMiddleware(thunk)(createStore);
const store = storeWithMiddleware(rootReducer);

// State object management via redux
import * as actions from './actions';

// Controls
import Input from './controls/input';

export default class Geocoder extends mapboxgl.Control {

  options = {
    position: 'top-left',
    proximity: null
  }

  constructor(options) {
    super();
    this.actions = bindActionCreators(actions, store.dispatch);
    this.options = assign(this.options, options);
  }

  onAdd(map) {
    const { container } = store.getState();

    this.container = container ? typeof container === 'string' ?
      document.getElementById(container) : container : map.getContainer();

    const el = document.createElement('div');
    el.className = 'geocoder-control geocoder-control-inputs';

    this.container.appendChild(el);

    // Add controllers to the page
    new Input(el, store, this.actions);

    return el;
  }

  // API Methods
  // ============================

  /**
   * Return the input
   * @returns {Object} input
   */
  getInput() {
    return store.getState().input;
  }

  /**
   * Set input
   * @param {Array|String} query An array of coordinates [lng, lat] or location name as a string.
   * @returns {Geocoder} this
   */
  setInput(query) {
    this.actions.queryInput(query);
    return this;
  }

  /**
   * Subscribe to events that happen within the plugin.
   * @param {String} type name of event. Available events and the data passed into their respective event objects are:
   * - __geocoder.clear__ `Emitted when the input is cleared`
   * - __geocoder.loading__ `Emitted when the geocoder is looking up a query`
   * - __geocoder.input__ `{ feature } Fired when input is set`
   * - __geocoder.error__ `{ error } Error as string
   * @param {Function} fn function that's called when the event is emitted.
   * @returns {Geocoder} this;
   */
  on(type, fn) {
    this.actions.eventSubscribe(type, fn);
    return this;
  }
}
