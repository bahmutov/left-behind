import barsReporter from './reporter-bars';

var la = require('lazy-ass');
var check = require('check-more-types');

la(check.fn(barsReporter), 'could not load bars reporter', barsReporter);

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
    bars: barsReporter
  };
  var reporter = reporterModules[reporterName];
  la(check.fn(reporter),
    'missing reporter module', options, reporterName,
    'available', reporterModules);

  var fetchOptions = {
    concurrency: 5
  };

  Promise.resolve(topDeps.topDependents(name, n))
    .then(function (list) {
      console.log('found %d %s dependent on %s',
        list.length, pluralize('package', list.length), name);
      log('these packages depend on %s', name);
      log(list);
      return list;
    })
    .then(function (list) {
      log('leaving just a sample of %d dependents out of %d', n, list.length);
      return _.sample(list, n);
    })
    .map(getPackage, fetchOptions)
    .then(function (list) {
      // list of package.json files
      return list.map(function findVersion(pkg) {
        return {
          name: pkg.name,
          uses: findUsedVersion(name, pkg)
        };
      });
    })
    .tap(function (versions) {
      console.log('package %s', name, 'is used by', versions.length, 'dependent',
        pluralize('package', versions.length));
    })
    .then(function (versions) {
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
        return info &&
          check.unemptyString(info.uses) &&
          semver.valid(info.uses);
      });
    })
    .then(function (versions) {
      return versions.map(function (dep) {
        dep.uses = stripV(dep.uses);
        return dep;
      });
    })
    .then(function (versions) {
      console.log('%d dependent %s after version filtering',
        versions.length, pluralize('package', versions.length));
      log(versions);

      return getPackage(name).then(function (pkg) {
        return [name, pkg.version, versions];
      });
    })
    .spread(reporter);
}

module.exports = leftBehind;
