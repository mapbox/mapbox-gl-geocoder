import template from 'lodash.template';
import debounce from 'lodash.debounce';
import typeahead from 'suggestions';

let fs = require('fs'); // substack/brfs#39
let tmpl = template(fs.readFileSync(__dirname + '/../templates/input.html', 'utf8'));

/**
 * Input controller
 *
 * @param {HTMLElement} el Summary parent container
 * @param {Object} store A redux store
 * @param {Object} actions Actions an element can dispatch
 * @private
 */
export default class Inputs {
  constructor(el, store, actions) {
    const { inputQuery, profile } = store.getState();

    el.innerHTML = tmpl({
      inputQuery,
      profile
    });

    this.container = el;
    this.actions = actions;
    this.store = store;

    this.onAdd();
    this.render();
  }

  onAdd() {
    const {
      queryInput,
      addInput,
      clearInput
    } = this.actions;

    this.inputInput = this.container.querySelector('.js-input');
    this.inputClear = this.container.querySelector('.js-input-clear');
    this.loading = this.container.querySelector('.js-input-loading');

    // Events
    // ============================

    // Autosuggest
    this.inputInput.addEventListener('keypress', debounce((e) => {
      queryInput(e.target.value);
    }), 100);

    this.inputInput.addEventListener('change', () => {
      if (this.inputTypeahead.selected) {
        const coords = this.inputTypeahead.selected.center;
        // TODO set Input
      }
    });

    this.inputClear.addEventListener('click', clearInput);
    this.inputTypeahead = new typeahead(this.inputInput, []);

    // Filter results by place_name
    this.inputTypeahead.getItemValue = function(item) { return item.place_name; };
  }

  render() {
    this.store.subscribe(() => {
      const {
        inputQuery,
        loading,
        inputResults
      } = this.store.getState();

      if (!inputResults.length) this.inputTypeahead.selected = null;

      this.inputTypeahead.update(inputResults);
      this.inputClear.classList.toggle('active', inputResults.length);
      this.loading.classList.toggle('active', loading);

      var onChange = document.createEvent('HTMLEvents');
      onChange.initEvent('change', true, false);

      // Adjust values if input is not :focus
      // or query remains unchanged.
      if (this.inputInput !== document.activeElement &&
          this.inputInput.value !== inputQuery) {
        this.inputInput.value = inputQuery;
        this.inputInput.dispatchEvent(onChange);
      }
    });
  }
}
