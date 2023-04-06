import test from 'tape';

// // Tests
import './test.geocoder';
import './test.ui';

// close the smokestack window once tests are complete
test('shutdown', function(t) {
  t.end();
  setTimeout(function() {
    window.close();
  }, 0);
});
