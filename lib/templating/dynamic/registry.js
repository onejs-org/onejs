var logging   = require('../../logging'),
    templates = require('./templates');

module.exports = function registryTemplate(options, callback){
  logging.debug('Rendering registry');

  templates.registry(options, callback);
};
