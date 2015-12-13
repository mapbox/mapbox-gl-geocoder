import * as types from '../constants/action_types';
import MapboxClient from 'mapbox';
let mapbox;

function inputResults(q, results) {
  return {
    type: types.INPUT,
    query: q,
    results
  };
}

function geocode(q, callback) {
  return (dispatch, getState) => {
    const { proximity } = getState();
    const options = proximity ? {
      proximity: {
        longitude: proximity[0],
        latitude: proximity[1]
      }
    } : {};

    return mapbox.geocodeForward(q.trim(), options, (err, res) => {
      // TODO dispatch setError
      if (err) throw err;
      if (res.error) return dispatch(setError(res.error));
      dispatch(setError(null));
      return dispatch(callback(res.features));
    });
  };
}

function setLoading(loading) {
  return dispatch => {
    dispatch({
      type: 'LOADING',
      loading
    });
    if (loading) dispatch(eventEmit('geocoder.loading'));
  };
}

function setError(error) {
  return dispatch => {
    dispatch({
      type: 'ERROR',
      error
    });
    if (error) dispatch(eventEmit('geocoder.error', { error: error }));
  };
}

export function setOptions(options) {
  const accessToken = (options.accessToken) ?
    options.accessToken :
    mapboxgl.accessToken;

  mapbox = new MapboxClient(accessToken);

  return {
    type: types.SET_OPTIONS,
    options: options
  };
}

export function queryInput(q) {
  return (dispatch) => {
    dispatch(setLoading(true));
    return dispatch(geocode(q, (results) => {
      dispatch(setLoading(false));
      return dispatch(inputResults(q, results));
    }));
  };
}

export function query(input) {
  return (dispatch) => {
    const q = (typeof input === 'string') ? input : input.join();
    dispatch(setLoading(true));
    return dispatch(geocode(q, (results) => {
      dispatch(setLoading(false));
      if (!results.length) return;
      const result = results[0];
      dispatch(queryInput(result.geometry.coordinates));
      return dispatch(inputResults(result.place_name, results));
    }));
  };
}

export function eventSubscribe(type, fn) {
  return (dispatch, getState) => {
    const { events } = getState();
    events[type] = events[type] || [];
    events[type].push(fn);
    return {
      type: types.EVENTS,
      events
    };
  };
}

export function eventEmit(type, data) {
  return (dispatch, getState) => {
    const { events } = getState();

    if (!events[type]) {
      return {
        type: types.EVENTS,
        events
      };
    }

    const listeners = events[type].slice();

    for (var i = 0; i < listeners.length; i++) {
      listeners[i].call(this, data);
    }
  };
}

export function clear() {
  return dispatch => {
    dispatch({
      type: types.INPUT_CLEAR
    });
    dispatch(eventEmit('geocoder.clear'));
    dispatch(setError(null));
  };
}
