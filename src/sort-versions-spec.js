var la = require('lazy-ass');
var check = require('check-more-types');

/* global describe, it */
describe('sorting by version', function () {
  var sortByVersion = require('./sort-by-version');

  var info = {
    '0.5.1': 2,
    '0.2.0': 1,
    '1.1.0': 7,
    '0.6.0': 14
  };

  it('is a function', function () {
    la(check.fn(sortByVersion));
  });

  it('sorts by version', function () {
    var sorted = sortByVersion(info);
    la(check.object(sorted));
  });
});
