var debug      = require("./debug")('dependencies-of'),
    uniques    = require('uniques'),
    find       = require('./find'),
    newPackage;

module.exports = dependenciesOf;

function createPackage(filename){
  if( ! filename ) return undefined;

  newPackage || ( newPackage = require('./package') );
  return newPackage(filename);
}

function dependenciesOf(module){
  debug('Loading the dependencies of %s', module);

  var packageRequires = module.requires.filter(isNotRelative),
      packages        = packageRequires.map(locate).map(createPackage);

  packageRequires.forEach(function(uri, ind){
    if( ! packages[ind] ) return;

    module.map[uri] = packages[ind].main;
  });

  return flatten(module, packages.filter(isNotNil));

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
