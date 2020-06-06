var grunt = require('grunt');
var expect = require('expect.js');
var collectPidFiles = require('../lib/collect-pid-files');

describe('collectPidFiles', function () {

  it('returns contents of files as parsed integers', function () {
    var result = collectPidFiles([ __dirname + '/pid-test1.txt', __dirname + '/pid-test2.txt' ], grunt);
    expect(result).to.have.length(2);

    expect(result[0]).to.be.a('number');
    expect(result[0]).to.equal(1234);

    expect(result[1]).to.be.a('number');
    expect(result[1]).to.equal(474649);
  });

  it('ignores files which do not exist', function () {
    var result = collectPidFiles([ __dirname + '/pid-test1.txt', __dirname + '/non-existent-pid-file.txt' ], grunt);

    expect(result).to.have.length(1);
    expect(result[0]).to.equal(1234);
  });

  it('ignores files which are not pure integer content', function () {
    var result = collectPidFiles([ __dirname + '/pid-test3.txt' ], grunt);
    expect(result).to.be.empty();
  });

  it ('returns an empty array if null array passed in', function () {
    var result = collectPidFiles(null, grunt);

    expect(result).to.be.an('array');
    expect(result).to.be.empty();
  });

});
