var debug          = require("./debug")('package'),
    fs             = require("fs"),
    path           = require("path"),
    memoize        = require('memoize-sync'),
    newModule      = require('./module');

module.exports = memoize(newPackage);

function newPackage(name, entry){
  debug('New package: %s (%s)', name, entry);

  var pack = {
    name     : name
  };

  pack.toString = function(){
    return '(Package ' + name + ')';
  };

  pack.main         = newModule(entry);

  if (!pack.main) {
    debug('Nothing found for %s at %s', name, entry);
    return undefined;
  }

  pack.dependencies = pack.main.dependencies;

  return pack;
}
