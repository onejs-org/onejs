var debug   = require('../../debug')('require'),
    templates = require('./templates');

module.exports = function requireTemplate(options, callback){
  debug('Rendering require');

  templates.require(options, callback);
};
