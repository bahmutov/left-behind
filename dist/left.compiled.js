'use strict';

var la$2 = require('lazy-ass');
var check$2 = require('check-more-types');
var _$1 = require('lodash');
var semver$2 = require('semver');

function compareFirstArguments(fn) {
  la$2(check$2.fn(fn), 'expected a function', fn);
  return function (a, b) {
    return fn(a[0], b[0]);
  };
}

var compareVersions = compareFirstArguments(semver$2.compare);

// TODO move to k2, make more general
function sortByVersion(o, descending) {
  la$2(check$2.object(o));

  var list = _$1.pairs(o);
  // [[version, name], [version, name], ...]

  var sortedVersions = list.sort(compareVersions);
  if (descending) {
    sortedVersions = sortedVersions.reverse();
  }
  var sorted = _$1.zipObject(sortedVersions);
  return sorted;
}

var la$1 = require('lazy-ass');
var check$1 = require('check-more-types');
var bars = require('bars');
var toExactSemver = require('to-exact-semver');
var semver$1 = require('semver');
var hr = require('hr');
var chalk = require('chalk');
var pluralize$1 = require('pluralize');

function findLineSemver(line) {
  var regular = /^\s*([0-9]+)\.([0-9]+)\.([0-9]+)/;
  var matches = regular.exec(line);
  if (check$1.array(matches)) {
    return matches[0].trim();
  }
}

function split(version) {
  la$1(check$1.unemptyString(version), 'expected version', version);
  return {
    major: semver$1.major(version),
    minor: semver$1.minor(version),
    patch: semver$1.patch(version)
  };
}

function reporter(name, currentVersion, versionInfo) {
  la$1(check$1.unemptyString(name), 'missing current package name', name);
  la$1(check$1.unemptyString(currentVersion), 'missing current version', currentVersion);

  la$1(check$1.array(versionInfo));
  var data = {};
  versionInfo.forEach(function (info) {
    la$1(check$1.unemptyString(info.uses), info);
    var exactVersion = toExactSemver(info.name, info.uses);
    if (check$1.not.unemptyString(exactVersion)) {
      return;
    }

    if (data[exactVersion]) {
      data[exactVersion] += 1;
    } else {
      data[exactVersion] = 1;
    }
  });

  var sortedData = sortByVersion(data);
  la$1(check$1.object(sortedData), 'could not sort data by version', data);

  var current = split(currentVersion);

  hr.hr('-');
  console.log('Checked %d %s for %s@%s', versionInfo.length, pluralize$1('dependent', versionInfo.length), name, currentVersion);
  console.log();

  var histogram = bars(sortedData);
  var lines = histogram.split('\n').map(function (line) {
    var lineSemver = findLineSemver(line);
    if (check$1.unemptyString(lineSemver)) {
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

var la = require('lazy-ass');
var check = require('check-more-types');
var topDeps = require('top-dependents');
var Promise = require('bluebird');
var getPackageJson = require('get-package');
var _ = require('lodash');
var log = require('debug')('behind');
var toExact = require('to-exact-semver');
var semver = require('semver');
var pluralize = require('pluralize');

function getPackage(name) {
  return new Promise(function (resolve, reject) {
    getPackageJson(name, function (err, json) {
      if (err) {
        return reject(err);
      }
      resolve(json);
    });
  });
}

function findUsedVersion(name, pkg) {
  if (pkg.dependencies) {
    if (pkg.dependencies[name]) {
      return pkg.dependencies[name];
    }
  }
  if (pkg.devDependencies) {
    if (pkg.devDependencies[name]) {
      return pkg.devDependencies[name];
    }
  }
}

function stripV(version) {
  var leadingV = /^v/;
  if (leadingV.test(version)) {
    return version.substr(1);
  }
  return version;
}

function leftBehind(options) {
  la(check.object(options), 'missing options', options);
  var name = options.name;
  var n = options.n || options.maxN || 30;

  var reporterName = options.reporter || 'bars';
  var reporterModules = {
    bars: reporter
  };
  var reporterModule = reporterModules[reporterName];
  la(check.unemptyString(reporterModule), 'missing reporter module', options, reporterName);
  var reporter$$ = require(reporterModule);
  la(check.fn(reporter$$), 'missing reporter', reporter$$, reporterModule);

  var fetchOptions = {
    concurrency: 5
  };

  Promise.resolve(topDeps.topDependents(name, n)).then(function (list) {
    console.log('found %d %s dependent on %s', list.length, pluralize('package', list.length), name);
    log('these packages depend on %s', name);
    log(list);
    return list;
  }).then(function (list) {
    log('leaving just a sample of %d dependents out of %d', n, list.length);
    return _.sample(list, n);
  }).map(getPackage, fetchOptions).then(function (list) {
    // list of package.json files
    return list.map(function findVersion(pkg) {
      return {
        name: pkg.name,
        uses: findUsedVersion(name, pkg)
      };
    });
  }).tap(function (versions) {
    console.log('package %s', name, 'is used by', versions.length, 'dependent', pluralize('package', versions.length));
  }).then(function (versions) {
    return versions.map(function (info) {
      var usesVersion = info.uses;
      if (check.not.unemptyString(usesVersion)) {
        return;
      }
      var exact = toExact(info.name, usesVersion);
      if (check.unemptyString(exact)) {
        return {
          name: info.name,
          uses: exact
        };
      }
    }).filter(function hasVersion(info) {
      return info && check.unemptyString(info.uses) && semver.valid(info.uses);
    });
  }).then(function (versions) {
    return versions.map(function (dep) {
      dep.uses = stripV(dep.uses);
      return dep;
    });
  }).then(function (versions) {
    console.log('%d dependent %s after version filtering', versions.length, pluralize('package', versions.length));
    log(versions);

    return getPackage(name).then(function (pkg) {
      return [name, pkg.version, versions];
    });
  }).spread(reporter$$);
}

module.exports = leftBehind;