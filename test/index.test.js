/* eslint no-unused-vars: "off" */

const path = require('path');
const chai = require('chai');
const mock = require('mock-fs');

const expect = chai.expect;

chai.use(require('chai-as-promised'));

describe('readr', function () {
  let readr;

  before(function (done) {
    mock({
      'test/target': {
        nested: {
          'example.txt': 'Example content'
        },
        'test.json': '{"foo":"bar"}',
        subdir: {}
      }
    });
    readr = require('../.');
    done();
  });

  it('returns a promise', function () {
    return expect(readr('test/target')).to.be.fullfilled;
  });

  it('rejects if the target directory does not exist', function () {
    return expect(readr('does/not/exist')).to.be.rejected;
  });

  it('recursively lists the contents of a directory', function () {
    const result = readr('test/target').then(files => files.sort());
    return expect(result).to.eventually.eql([
      'test/target/nested',
      'test/target/nested/example.txt',
      'test/target/test.json',
      'test/target/subdir'
    ].sort());
  });

  it('ignores filtered files', function () {
    const filter = (filePath, stat) => stat.isFile();
    const result = readr('test/target', filter).then(files => files.sort());
    return expect(result).to.eventually.eql([
      'test/target/nested/example.txt',
      'test/target/test.json'
    ].sort());
  });

  it('ignores nested filtered files', function () {
    const filter = (filePath, stat) => path.extname(filePath) !== '.txt';
    const result = readr('test/target', filter).then(files => files.sort());
    return expect(result).to.eventually.eql([
      'test/target/nested',
      'test/target/test.json',
      'test/target/subdir'
    ].sort());
  });

  after(function () {
    mock.restore();
  });
});
