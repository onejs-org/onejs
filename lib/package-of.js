var debug        = require("./debug")('package-of'),
    exists       = require('fs').existsSync,
    path         = require('path'),
    readManifest = require('./manifest'),
    newPackage   = require('./package').create;

module.exports = packageOf;

function packageOf(module){
  var filename = path.join(path.dirname(module.filename), 'package.json'),
      manifest, pack;

  debug('Finding the package of %s at %s', module.filename, filename);

  if ( ! exists(filename) ) return;

  debug('Found a manifest at %s', filename);

  manifest = readManifest(filename);
  pack = newPackage(manifest.name, filename, undefined, module);

  return pack;
}
