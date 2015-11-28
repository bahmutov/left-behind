#!/usr/bin/env node

function noArguments() {
  return process.argv.length < 3;
}

function showHelp() {
  var join = require('path').join;
  var pkg = require(join(__dirname, '..', 'package.json'));
  console.log('%s@%s - %s', pkg.name, pkg.version, pkg.description);
  console.log('use: %s <package name>', pkg.name);
}

if (noArguments()) {
  showHelp();
  process.exit(0);
}

var name = process.argv[2];

var nconf = require('nconf');
nconf.env().argv();
nconf.defaults({
  n: 30
});

var leftBehind = require('..');

leftBehind({
  name: name,
  n: nconf.get('n')
});
