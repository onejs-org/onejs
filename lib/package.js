var debug     = require("./debug")('package'),
    fs        = require("fs"),
    path      = require("path"),
    memoize   = require('memoize-sync'),
    newModule = require('./module'),

    locked    = {};

module.exports = memoize(newPackage);

function newPackage(name, entry){
  debug('New package: %s (%s)', name, entry);

  if(locked[name]){
    debug('%s is locked.', name);
    return locked[name];
  }

  var pack = {
    id   : newModule.id(),
    name : name
  };

  pack.toString = function(){
    return '(Package ' + name + ')';
  };

  locked[name] = pack;
  pack.main    = newModule(entry, undefined, pack.id);
  delete locked[name];

  if (!pack.main) {
    debug('Nothing found for %s at %s', name, entry);
    return undefined;
  }

  pack.dependencies = pack.main.dependencies;
  pack.render = pack.main.render;

  return pack;
}
