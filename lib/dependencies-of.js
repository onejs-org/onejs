var debug      = require("./debug")('dependencies-of'),
    find       = require('./find'),
    options    = require('./options'),
    coreModule = require('./core-module'),
    newDependency;

module.exports = dependenciesOf;

function createPackage(filename){
  if( ! filename ) return undefined;
  newDependency || ( newDependency = require('./dependency') );
  return newDependency(filename);
}

function dependenciesOf(module){
  debug('Loading the dependencies of %s', module);

  var coreURIs        = [],
      packageRequires = module.requires.filter(isNotRelative).filter(isNotCore),
      packages        = packageRequires.map(locate).map(createPackage);

  packages = packages.concat(coreURIs.map(coreModule));
  packageRequires = packageRequires.concat(coreURIs);

  debug('Require calls from %s: %s processed as %s', module, module.requires.join(','), packageRequires.join(','));

  packageRequires.forEach(function(uri, ind){
    if( ! packages[ind] ) return;

    debug('Mapping the require call "%s" to %s', uri, packages[ind]);

    module.map[uri] = packages[ind].id;
  });

  return module, packages.filter(isNotNil);

  function isNotCore(uri){
    if( options.native() || !coreModule.is(uri)) return true;
    debug('"%s" is core module', uri);
    coreURIs.push(uri);
  }

  function locate(pack){
    return find(module, pack);
  }

}

function isNotNil(o){
  return !!o;
}

function isNotRelative(uri){
  return ! /^\./.test(uri);
}
