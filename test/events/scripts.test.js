'use strict';
/*global describe:true, it: true, afterEach: true, beforeEach: true, after:true */
var cli = require('../../lib/cli/'),
    path = require('path'),
    testUtils = require('../utils'),
    utils = require('../../lib/utils'),
    exec = require('../../lib/config/exec'),
    nodemon = require('../../lib/nodemon'),
    command = require('../../lib/config/command'),
    appjs = path.resolve(__dirname, '..', 'fixtures', 'env.js'),
    assert = require('assert');

function asCLI(cmd) {
  return ('node nodemon ' + (cmd|| '')).trim();
}

function parse(cmd) {
  var parsed = cli.parse(cmd);
  parsed.execOptions = exec(parsed);
  return parsed;
}

function commandToString(command) {
  return command.executable + (command.args.length ? ' ' + command.args.join(' ') : '');
}

describe('nodemon API events', function () {
  var pwd = process.cwd(),
      oldhome = utils.home;

  afterEach(function () {
    process.chdir(pwd);
    utils.home = oldhome;
  });

  after(function (done) {
    // clean up just in case.
    nodemon.once('exit', function () {
      nodemon.reset(done);
    }).emit('quit');
  });

  beforeEach(function (done) {
    // move to the fixtures directory to allow for config loading
    process.chdir(path.resolve(pwd, 'test/fixtures'));
    utils.home = path.resolve(pwd, ['test', 'fixtures', 'events'].join(path.sep));

    nodemon.reset(done);
  });

  it('should trigger start event script', function (done) {
    var plan = new testUtils.Plan(2, done);
    nodemon({
      script: testUtils.appjs,
      verbose: true,
      stdout: false,
    }).on('start', function () {
      plan.assert(true, 'started');
    }).on('exit', function () {
      plan.assert(true, 'exit');
    }).on('stdout', function (data) {
      console.log(data);
    });
  });
});