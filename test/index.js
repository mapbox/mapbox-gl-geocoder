"use strict";

var test = require("tape");

// Tests
require("./test.geocoder");
require("./test.ui");

// close the smokestack window once tests are complete
test("shutdown", function (t) {
  t.end();
  setTimeout(function () {
    window.close();
  }, 0);
});
