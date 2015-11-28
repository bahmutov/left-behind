var la = require('lazy-ass');
var check = require('check-more-types');
var _ = require('lodash');
var semver = require('semver');

/* global describe, it */
describe('semver comparison', function () {
  it('compared correctly versions', function () {
    la(semver.lt('1.8.2', '2.2.0'));
    la(semver.gt('2.2.0', '1.8.2'));
  });
});

describe('sorting by version', function () {
  var sortByVersion = require('./sort-by-version');

  var info = {
    '0.5.1': 2,
    '0.2.0': 1,
    '1.1.0': 7,
    '0.6.0': 14
  };
  var expectedSortedVersions = [
    '0.2.0',
    '0.5.1',
    '0.6.0',
    '1.1.0'
  ];

  it('is a function', function () {
    la(check.fn(sortByVersion));
  });

  it('sorts by version', function () {
    var sorted = sortByVersion(info);
    la(check.object(sorted));
    var keys = Object.keys(sorted);
    la(_.isEqual(keys, expectedSortedVersions),
      'could not sort versions', sorted);
  });
});
