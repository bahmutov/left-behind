var la = require('lazy-ass');
var check = require('check-more-types');

function sortByVersion(data) {
  la(check.object(data));

  return data;
}

module.exports = sortByVersion;
