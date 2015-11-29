#!/usr/bin/env node

require('simple-bin-help')({
  minArguments: 3,
  packagePath: __dirname + '/../package.json',
  help: 'use: left-behind <package name>'
});

var name = process.argv[2];

var nconf = require('nconf');
nconf.env().argv();
nconf.defaults({
  n: 100
});

var leftBehind = require('..');

leftBehind({
  name: name,
  n: nconf.get('n')
});
