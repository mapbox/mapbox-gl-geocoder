function Geolocation() {}

Geolocation.prototype = {

  isSupport: function() {
    return Boolean(window.navigator.geolocation);
  },

  getCurrentPosition: function() {
    const positionOptions = {
      enableHighAccuracy: true
    };

    return new Promise(function(resolve, reject) {
      window.navigator.geolocation.getCurrentPosition(resolve, reject, positionOptions);
    });
  },
}

module.exports = Geolocation;
