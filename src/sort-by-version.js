var la = require('lazy-ass');
var check = require('check-more-types');
var _ = require('lodash');
var semver = require('semver');

function compareFirstArguments(fn) {
  la(check.fn(fn), 'expected a function', fn);
  return function (a, b) {
    return fn(a[0], b[0]);
  };
}

var compareVersions = compareFirstArguments(semver.compare);

// TODO move to k2, make more general
function sortByVersion(o, descending) {
  la(check.object(o));

  var list = _.pairs(o);
  // [[version, name], [version, name], ...]

  var sortedVersions = list.sort(compareVersions);
  if (descending) {
    sortedVersions = sortedVersions.reverse();
  }
  var sorted = _.zipObject(sortedVersions);
  return sorted;
}

// module.exports = sortByVersion;
export default sortByVersion;
