var la = require('lazy-ass');
var check = require('check-more-types');
var bars = require('bars');

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

  console.log();
  console.log(bars(data));
}

module.exports = reporter;
