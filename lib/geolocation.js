function Geolocation() {}

Geolocation.prototype = {

  isSupport: function() {
    return this.supportsGeolocation;
  },

  getCurrentPosition: function() {
    const positionOptions = {
      enableHighAccuracy: true
    };

    return new Promise(function(res, rej) {
      window.navigator.geolocation.getCurrentPosition(res, rej, positionOptions);
    });
  },

  checkGeolocationSupport: function () {
    return new Promise(function(res, rej) {
      if (this.supportsGeolocation !== undefined) {
        res(this.supportsGeolocation);
    
      } else if (window.navigator.permissions !== undefined) {
        // navigator.permissions has incomplete browser support
        // http://caniuse.com/#feat=permissions-api
        // Test for the case where a browser disables Geolocation because of an
        // insecure origin
        window.navigator.permissions.query({name: 'geolocation'}).then(function (p) {
          //TODO: PermissionStatus{state: 'denied', onchange: null}
          this.supportsGeolocation = p.state !== 'denied';
          res(this.supportsGeolocation);
        }.bind(this)).catch(rej);
    
      } else {
        this.supportsGeolocation = !!window.navigator.geolocation;
        res(this.supportsGeolocation);
      }
    }.bind(this)).then(function (supportsGeolocation) {
      this.supportsGeolocation  = supportsGeolocation;
      return supportsGeolocation;
    }.bind(this));
  },
}

module.exports = Geolocation;
