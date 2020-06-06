var grunt = require('grunt');
var expect = require('expect.js');
var findPids = require('../lib/find-pids');

describe('findPids', function () {

  it('returns pids from pid files, if filesSrc is specified', function () {
    // Simulates the interface from Grunt.
    var task = {
      filesSrc: [ __dirname + '/pid-test1.txt' ],
      options: {}
    };

    var pids = findPids(task, grunt);

    expect(pids).to.have.length(1);
    expect(pids[0]).to.be(1234);
  });

  it ('returns an array with a single pid if the pid option is specified as a number', function () {
    expectSingleElementPidArrayWithInputOutput(57, 57, grunt);
  });

  it('interprets a string representation of a number as a numeric pid', function () {
    expectSingleElementPidArrayWithInputOutput('57', 57, grunt);
  });

  it('interprets a string file name as a pid file', function () {
    expectSingleElementPidArrayWithInputOutput(__dirname + '/pid-test2.txt', 474649, grunt);
  });

  it('executes the pid function if it is a function', function () {
    expectSingleElementPidArrayWithInputOutput(function () {
      return 387;
    }, 387, grunt);
  });

  it('returns an empty array of pids if nothing specified in grunt task config', function () {
    var pids = findPids({ filesSrc: [], options: {} }, grunt);

    expect(pids).to.be.an('array');
    expect(pids).to.be.empty();
  });

});

function expectSingleElementPidArrayWithInputOutput(input, output, grunt) {
  var task = {
    filesSrc: [],
    options: {
      pid: input
    }
  };

  var pids = findPids(task, grunt);

  expect(pids).to.be.an('array');
  expect(pids).to.have.length(1);
  expect(pids).to.contain(output);
}
