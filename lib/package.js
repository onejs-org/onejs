var debug          = require("./debug")('package'),
    fs             = require("fs"),
    path           = require("path"),
    memoize        = require('memoize-sync'),
    dependenciesOf = require('./dependencies-of'),
    newModule      = require('./module'),
    manifestOf     = require('./manifest');

module.exports = newPackage;

function fromManifest(manifest){

  debug('New package: %s', manifest.name);

  var pack = {
    manifest : manifest,
    name     : manifest.name,
    version  : manifest.version
  };

  pack.toString = function(){
    return '(Package ' + pack.name + ')';
  };

  pack.main = mainModuleOf(pack);
  pack.dependencies = pack.main.dependencies;

  return pack;
}

fromManifest.cached = memoize(fromManifest, function(manifest){
  return manifest.name;
});

function isDirectory(filename){
  return fs.existsSync(filename) && fs.statSync(filename).isDirectory();
}

function mainModuleOf(pack){
  var filename = path.join(path.dirname(pack.manifest.at), pack.manifest.main || 'index.js');

  /\.js$/.test(filename) || ( filename += '.js' );
  isDirectory(filename) && ( path.join(filename, 'index.js') );

  debug('Recognized main module for %s is %s', pack.manifest.name, filename);

  return newModule(filename, pack);
}

function newPackage(filename){
  debug('Creating new package from %s', filename);

  var manifest = manifestOf(filename);

  if(manifest) return fromManifest.cached(manifest);

}
