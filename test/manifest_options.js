var assert            = require('assert'),
    one               = require('../lib'),
    common            = require('./common'),
    assertListContent = common.assertListContent;

exports.init = function init(options, callback){
  if(options.target){
    callback(undefined, require(options.target));
    return;
  }

  common.build('test/packages/sai', undefined, [], function(exitCode){
    callback(undefined, require('../tmp/sai'));
  });
}

exports.testExcluding = function(sai, done){
  assert.deepEqual(['monouchi', 'sai', 'main', 'tsume'], Object.keys(sai.packages));
  done();
};

exports.testTies = function(sai, done){
  assert.equal(Math.PI, sai.require('pi'));
  assert.equal(Number.MAX_VALUE, sai.require('max'));
  done();
};

exports.testSplitting = function(sai, done){
  var tsume = require('../tmp/tsume');
  done();
};
