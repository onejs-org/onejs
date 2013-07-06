var debug       = require("./debug")('package'),
    fs          = require("fs"),
    path        = require("path"),
    memoize     = require('memoize-sync'),
    componentAt = require('./component-at'),
    newModule   = require('./module'),

    locked    = {};

module.exports = memoize(newPackage);

function newPackage(name, entry, isEntry){
  debug('New package: %s (%s)', name, entry);

  if(locked[name]){
    debug('%s is locked.', name);
    return locked[name];
  }

  var pack = {
    component : componentAt(path.dirname(entry)),
    id        : newModule.id(),
    name      : name
  };

  pack.toString = function(){
    return '(Package ' + name + ')';
  };

  locked[name] = pack;
  pack.main    = newModule(entry, pack, pack.id, isEntry);
  delete locked[name];

  if (!pack.main) {
    debug('Nothing found for %s at %s', name, entry);
    return undefined;
  }

  pack.dependencies = pack.main.dependencies;
  pack.render = pack.main.render;

  return pack;
}
