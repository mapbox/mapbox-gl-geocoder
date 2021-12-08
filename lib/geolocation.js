function Geolocation() {}

Geolocation.prototype = {

  isSupport: function() {
    return this.supportsGeolocation;
  },

  getCurrentPosition: function() {
    const positionOptions = {
      enableHighAccuracy: true
    };

    return new Promise(function(resolve, reject) {
      window.navigator.geolocation.getCurrentPosition(resolve, reject, positionOptions);
    });
  },

  checkGeolocationSupport: function () {
    return new Promise(function(resolve, reject) {
      if (this.supportsGeolocation !== undefined) {
        resolve(this.supportsGeolocation);
    
      } else if (window.navigator.permissions !== undefined) {
        // navigator.permissions has incomplete browser support
        // http://caniuse.com/#feat=permissions-api
        // Test for the case where a browser disables Geolocation because of an
        // insecure origin
        window.navigator.permissions.query({name: 'geolocation'}).then(function (permissions) {
          //TODO: PermissionStatus{state: 'denied', onchange: null}
          this.supportsGeolocation = permissions.state !== 'denied';
          resolve(this.supportsGeolocation);
        }.bind(this)).catch(reject);
    
      } else {
        this.supportsGeolocation = !!window.navigator.geolocation;
        resolve(this.supportsGeolocation);
      }
    }.bind(this)).then(function (supportsGeolocation) {
      this.supportsGeolocation  = supportsGeolocation;
      return supportsGeolocation;
    }.bind(this));
  },
}

module.exports = Geolocation;
