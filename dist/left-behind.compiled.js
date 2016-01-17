#!/usr/bin/env node


'use strict';

var leftBehind = require('..');
leftBehind = 'default' in leftBehind ? leftBehind['default'] : leftBehind;

require('simple-bin-help')({
  minArguments: 3,
  packagePath: __dirname + '/../package.json',
  help: 'use: left-behind <package name>'
});

var name = process.argv[2];

var nconf = require('nconf');
nconf.env().argv();
nconf.defaults({
  n: 100 // sample n dependent modules, not all
});

leftBehind({
  name: name,
  n: nconf.get('n')
});