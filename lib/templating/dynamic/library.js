var juxt      = require('functools').juxt.async,
    selfPath  = require('./path'),
    debug     = require('../../debug')('library'),
    env       = require('../env'),
    version   = require('../version'),
    templates = require('./templates');

function library(options, callback){

  debug('Rendering library...');

  var view = {
    debug          : options.debug,
    version        : version,
    versions       : '{}',
    env            : env(options)
  };

  juxt({ 'path': selfPath })(options, function(error, partials){

    if(error){
      callback(error);
      return;
    }

    templates.library(view, partials, callback);

  });

}

module.exports = library;
