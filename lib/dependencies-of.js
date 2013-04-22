var debug      = require("./debug")('dependencies-of'),
    uniques    = require('uniques'),
    find       = require('./find'),
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

  var core            = [],
      packageRequires = module.requires.filter(isNotRelative),
      packages        = packageRequires.filter(splitCore).map(locate).map(createPackage).concat(core);

  packageRequires.forEach(function(uri, ind){
    if( ! packages[ind] ) return;

    module.map[uri] = packages[ind].main;
  });

  return flatten(module, packages.filter(isNotNil));

  function splitCore(name){
    var m;
    if( ! (m = coreModule(name)) ) return true;
    core.push(m);
  }

  function locate(pack){
    return find(module, pack);
  }

}

function flatten(module, dependencies){
  var result, i;

  debug('Flattening %s and %s under %s', module.relatives, dependencies, module);

  result = dependencies.slice();
  i      = module.relatives.length;

  while( i --> 0 ){
    result.push.apply(result, module.relatives[i].dependencies);
  }

  i = dependencies.length;
  while( i --> 0 ){
    result.push.apply(result, dependencies[i].main.dependencies);
  }

  result = uniques(result);

  result.toString = function(){
    return result.map(nameOf).join(', ');
  };

  return result;
}

function isNotNil(o){
  return !!o;
}

function isNotRelative(uri){
  return ! /^\./.test(uri);
}

function nameOf(module){
  return module.name;
}
