var la = require('lazy-ass');
var check = require('check-more-types');
var bars = require('bars');
var sortByVersion = require('./sort-by-version');
var toExactSemver = require('to-exact-semver');

function reporter(versionInfo) {
  la(check.array(versionInfo));
  var data = {};
  versionInfo.forEach(function (info) {
    la(check.unemptyString(info.uses), info);
    var exactVersion = toExactSemver(info.name, info.uses);
    if (check.not.unemptyString(exactVersion)) {
      return;
    }

    if (data[exactVersion]) {
      data[exactVersion] += 1;
    } else {
      data[exactVersion] = 1;
    }
  });

  var sortedData = sortByVersion(data);
  la(check.object(sortedData), 'could not sort data by version', data);

  console.log();
  console.log(bars(sortedData));
}

module.exports = reporter;
