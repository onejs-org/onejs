var debug     = require('../../debug')('dynamic/module'),
    templates = require('./templates');

module.exports = function oneJSModule(pkg, treeName, options, module, callback){
  debug('Building module "'+module.id+'"');

  var view = {
    'treeName'              : treeName,
    'parentId'              : pkg.id,
    'id'                    : module.id,
    'content'               : module.content,
    'debug'                 : options.debug,
    'contentWithSourceURLs' : JSON.stringify(module.content + '//@ sourceURL=' + module.path)
  };

  templates.module(view, callback);

};
