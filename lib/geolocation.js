class Geolocation {
  isSupport() {
    return Boolean(window.navigator.geolocation);
  }

  getCurrentPosition() {
    const positionOptions = {
      enableHighAccuracy: true
    };

    return new Promise(function(resolve, reject) {
      window.navigator.geolocation.getCurrentPosition(resolve, reject, positionOptions);
    });
  }
}

module.exports = Geolocation;
