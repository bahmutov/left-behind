var la = require('lazy-ass');
var check = require('check-more-types');
var bars = require('bars');
var sortByVersion = require('./sort-by-version');

function reporter(versionInfo) {
  la(check.array(versionInfo));
  var data = {};
  versionInfo.forEach(function (info) {
    la(check.unemptyString(info.uses), info);
    if (data[info.uses]) {
      data[info.uses] += 1;
    } else {
      data[info.uses] = 1;
    }
  });

  var sortedData = sortByVersion(data);
  la(check.object(sortedData), 'could not sort data by version', data);

  console.log();
  console.log(bars(sortedData));
}

module.exports = reporter;
