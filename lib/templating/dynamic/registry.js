var debug     = require('../../debug')('dynamic/registry'),
    templates = require('./templates');

module.exports = function registryTemplate(options, callback){
  debug('Rendering registry');

  templates.registry(options, callback);
};
