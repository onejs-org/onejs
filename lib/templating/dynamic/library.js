var juxt         = require('functools').juxt.async,
    logging      = require('../../logging'),
    env          = require('../env'),
    version      = require('../version'),
    templates    = require('./templates'),
    oneJSPath    = require('./path');

function library(options, callback){

  logging.trace('Rendering library...');

  var view = {
    debug          : options.debug,
    version        : version,
    versions       : '{}',
    env            : env(options)
  };

  juxt({ 'path': oneJSPath })(options, function(error, partials){

    if(error){
      callback(error);
      return;
    }

    templates.library(view, partials, callback);

  });

}

module.exports = library;
