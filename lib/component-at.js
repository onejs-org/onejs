var debug    = require("./debug")('component'),
    exists   = require('fs').existsSync,
    parents  = require('parents'),
    path     = require('path'),
    manifest = require('./manifest');

module.exports = componentAt;
module.exports.findDependency = findDependency;

function componentAt(dir){
  var filename = path.join(dir, 'component.json'),
      component;

  if ( ! exists(filename) ) return;

  debug('Reading %s', filename);

  component = fix(manifest(filename));

  return component;
}

function findDependency(component, dependency){
  var dirs = parents(path.dirname(component.at)),
      name = component.dependencies[dependency],
      found, maybe, result;

  if ( ! name ) return;

  debug('Looking for %s', name);

  found = dirs.some(function(dir){
    maybe = path.join(dir, 'components', name, 'component.json');
    result = exists(maybe);
    return result;
  });

  if ( ! found ) return;

  debug('Found component dependency "%s" at "%s"', dependency, maybe);

  return maybe;
}

function fix(component){
  component.dependencies = fixDeps(component);
  component.devDependencies = fixDeps(component, 'development');
  component.component = true;
  return component;
}

function fixDeps(component, field){
  field || ( field = 'dependencies' );

  var result = {},
      key;

  for ( key in component[field] ) {
    result[key.replace(/^[^\//]+\//,'')] = key.replace(/\//g, '-');
  }

  return result;
}
