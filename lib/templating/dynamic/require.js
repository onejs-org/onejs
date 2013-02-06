var logging   = require('../../logging'),
    templates = require('./templates');

module.exports = function requireTemplate(options, callback){
  logging.debug('Rendering require');

  templates.require(options, callback);
};
