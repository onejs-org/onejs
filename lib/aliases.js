module.exports = function aliases(pkg, buildOptions){
  var result = pkg.manifest.web && pkg.manifest.web.alias || {};

  var i = buildOptions.alias && buildOptions.alias.length || 0, alias;
  while( i-- ){
    alias = buildOptions.alias[i];
    result[ alias.name ] = alias.orig;
  }

  return result;
};
