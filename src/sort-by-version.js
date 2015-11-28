var la = require('lazy-ass');
var check = require('check-more-types');
var _ = require('lodash');
var semver = require('semver');

function compareVersions(a, b) {
  var versionA = a[0];
  var versionB = b[0];
  return semver.lt(versionA, versionB);
}

// TODO move to k2, make more general
function sortByVersion(o, descending) {
  la(check.object(o));

  var list = _.pairs(o);
  // [[version, name], [version, name], ...]

  var sortedVersions = list.sort(compareVersions);
  if (!descending) {
    sortedVersions = sortedVersions.reverse();
  }
  // console.log('pairs sorted by version');
  // console.log(sortedVersions);

  var sorted = _.zipObject(sortedVersions);
  // console.log('sorted');
  //console.log(sorted);

  return sorted;
}

module.exports = sortByVersion;
