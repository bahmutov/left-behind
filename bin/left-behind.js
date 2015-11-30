#!/usr/bin/env node --harmony

'use strict';

// console.log(process.argv)

require('simple-bin-help')({
  minArguments: 3,
  packagePath: __dirname + '/../package.json',
  help: 'use: left-behind <package name>'
});

const name = process.argv[2];

const nconf = require('nconf');
nconf.env().argv();
nconf.defaults({
  n: 100 // sample n dependent modules, not all
});

const leftBehind = require('..');

leftBehind({
  name: name,
  n: nconf.get('n')
});
