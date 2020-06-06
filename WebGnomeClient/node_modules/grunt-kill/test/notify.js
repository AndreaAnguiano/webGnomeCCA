var expect = require('expect.js');
var sinon = require('sinon');
var notify = require('../lib/notify');

describe('notify', function () {
  
  it('records a failure if no processes were killed and at least one failed', function () {
    var grunt = createGruntSpy();
    notify(0, 1, 0, grunt);

    expect(grunt.fail.fatal.called).to.be(true);
    expect(grunt.fail.warn.called).to.be(false);
    expect(grunt.log.ok.called).to.be(false);
  });

  it('records a warning if we had some successes, but at least one permission error occured', function () {
    var grunt = createGruntSpy();
    notify(4, 0, 1, grunt);

    expect(grunt.fail.fatal.called).to.be(false);
    expect(grunt.fail.warn.called).to.be(true);
    expect(grunt.log.ok.called).to.be(false);
  });

  it('records a success if no processes were specified', function () {
    var grunt = createGruntSpy();
    notify(0, 0, 0, grunt);

    expectSuccess(grunt);
  });

  it('records a success if some processes were successfully killed and some were not found', function () {
    var grunt = createGruntSpy();
    notify(1, 3, 0, grunt);

    expectSuccess(grunt);
  });

  it('records a success if all processes were successfully killed and no errors occured', function () {
    var grunt = createGruntSpy();
    notify(4, 0, 0, grunt);

    expectSuccess(grunt);
  });

});

function createGruntSpy() {
  return {
    log: {
      ok: sinon.spy()
    },
    fail: {
      warn: sinon.spy(),
      fatal: sinon.spy()
    }
  };
}

function expectSuccess(grunt) {
  expect(grunt.fail.fatal.called).to.be(false);
  expect(grunt.fail.warn.called).to.be(false);
  expect(grunt.log.ok.called).to.be(true);
}
