var debug = require('./debug')('cli'),
    one   = require('../');

module.exports = cli;

function cli(options){

  var entry  = options._[0] || 'package.json',
      buffer = one(entry);

  if(options.debug) buffer.debug();
  if(options.global) buffer.global();
  if(options.native) buffer.native();

  if(options.ignore) {
    options.ignore.split(',').forEach(function(el){
      buffer.ignore(el);
    });
  }

  if(options.require) {
    options.require.split(',').forEach(function(el){
      buffer.require(el);
    });
  }

  if(options.target){
    buffer.save(options.target);
  } else {
    process.stdout.write(buffer.render());
  }

}
