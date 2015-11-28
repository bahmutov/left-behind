var la = require('lazy-ass');
var check = require('check-more-types');
var bars = require('bars');
var sortByVersion = require('./sort-by-version');
var toExactSemver = require('to-exact-semver');
var semver = require('semver');
var hr = require('hr');
var chalk = require('chalk');
var pluralize = require('pluralize');

function findLineSemver(line) {
  var regular = /^\s*([0-9]+)\.([0-9]+)\.([0-9]+)/;
  var matches = regular.exec(line);
  if (check.array(matches)) {
    return matches[0].trim();
  }
}

function split(version) {
  la(check.unemptyString(version), 'expected version', version);
  return {
    major: semver.major(version),
    minor: semver.minor(version),
    patch: semver.patch(version)
  };
}

function reporter(name, currentVersion, versionInfo) {
  la(check.unemptyString(name), 'missing current package name', name);
  la(check.unemptyString(currentVersion), 'missing current version', currentVersion);

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

  var current = split(currentVersion);

  hr.hr('-');
  console.log('Checked %d %s for %s@%s', versionInfo.length,
    pluralize('dependent', versionInfo.length), name, currentVersion);
  console.log();

  var histogram = bars(sortedData);
  var lines = histogram.split('\n').map(function (line) {
    var lineSemver = findLineSemver(line);
    if (check.unemptyString(lineSemver)) {
      var uses = split(lineSemver);
      if (uses.major < current.major) {
        return chalk.red(line);
      }
      if (uses.minor < current.minor) {
        return chalk.yellow(line);
      }
      return chalk.green(line);
    }
    return line;
  });
  console.log(lines.join('\n'));
}

module.exports = reporter;
