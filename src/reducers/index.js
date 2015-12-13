import * as types from '../constants/action_types.js';

const initialState = {
  position: 'top-left',
  proximity: false,
  events: {},
  input: {},
  inputQuery: '',
  loading: false,
  inputResults: []
};

function data(state = initialState, action) {
  switch (action.type) {
  case types.SET_OPTIONS:
    return Object.assign({}, state, action.options);

  case types.INPUT:
    return Object.assign({}, state, {
      input: action.input,
      inputQuery: action.query,
      inputResults: action.results
    });

  case types.CLEAR:
    return Object.assign({}, state, {
      input: {},
      inputQuery: '',
      inputResults: []
    });

  case types.LOADING:
    return Object.assign({}, state, {
      loading: action.loading
    });

  case types.ERROR:
    return Object.assign({}, state, {
      error: action.error
    });

  default:
    return state;
  }
}

export default data;
