var debug      = require("./debug")('core-module'),
    memoize    = require('memoize-sync'),
    core       = require('core-modules'),
    newPackage;

module.exports = memoize(coreModule);

function coreModule(name){
  if(!core[name]) return undefined;

  newPackage || ( newPackage = require('./package') );

  debug('Defining "%s" at %s', name, core[name]);

  return newPackage(name, core[name]);
}
