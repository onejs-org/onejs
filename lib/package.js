var debug       = require("./debug")('package'),
    fs          = require("fs"),
    path        = require("path"),
    memoize     = require('memoize-sync'),
    componentAt = require('./component-at'),
    newModule   = require('./module'),

    locked    = {};

module.exports = memoize(newPackage);
module.exports.create = create;

function create(name, entry, pack, module){
  pack || ( pack = {} );
  pack.component = componentAt(path.dirname(entry));
  pack.id        = module ? module.id : newModule.id();
  pack.name      = name;
  pack.toString = function(){
    return '(Package ' + name + ')';
  };

  return pack;
}

function newPackage(name, entry, isEntry){
  debug('New package: %s (%s)', name, entry);

  if(locked[name]){
    debug('%s is locked.', name);
    return locked[name];
  }

  var pack = locked[name] = {};
  pack      = create(name, entry, pack);
  pack.main = newModule(entry, pack, pack.id, isEntry);

  if  ( ! pack.main ) {
    debug('Nothing found for %s at %s', name, entry);
    return undefined;
  }

  pack.dependencies = pack.main.dependencies;
  pack.render = pack.main.render;

  delete locked[name];

  return pack;
}
