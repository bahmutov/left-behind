var la = require('lazy-ass');
var check = require('check-more-types');
var topDeps = require('top-dependents');
var Promise = require('bluebird');
var getPackageJson = require('get-package');

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

function findUsedVersion(name, package) {
  if (package.dependencies) {
    if (package.dependencies[name]) {
      return package.dependencies[name];
    }
  }
  if (package.devDependencies) {
    if (package.devDependencies[name]) {
      return package.devDependencies[name];
    }
  }
}

function leftBehind(options) {
  la(check.object(options), 'missing options', options);
  var name = options.name;
  var n = options.n || options.maxN || 10;

  var reporterName = options.reporter || 'bars';
  var reporterModules = {
    bars: './src/reporter-bars'
  };
  var reporterModule = reporterModules[reporterName];
  la(check.unemptyString(reporterModule),
    'missing reporter module', options, reporterName);
  var reporter = require(reporterModule);
  la(check.fn(reporter), 'missing reporter', reporter, reporterModule);

  Promise.resolve(topDeps.topDependents(name, n))
    .then(function (list) {
      console.log('this packages depend on %s', name);
      console.log(list);
      return list;
    })
    .map(getPackage)
    .then(function (list) {
      // list of package.json files
      return list.map(function findVersion(package) {
        return {
          name: package.name,
          uses: findUsedVersion(name, package)
        };
      });
    })
    .tap(function (versions) {
      console.log('package %s', name, 'is used by dependent projects');
      console.log(versions);
    })
    .then(function (versions) {
      return getPackage(name).
        then(function (pkg) {
          return [name, pkg.version, versions];
        });
    })
    .spread(reporter);
}

module.exports = leftBehind;
