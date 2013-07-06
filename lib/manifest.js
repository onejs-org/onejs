var debug    = require("./debug")('manifest'),
    parents  = require('parents'),
    path     = require("path"),
    fs       = require('fs'),
    exists   = fs.existsSync,
    readFile = fs.readFileSync;

module.exports = readManifest;

function findManifest(filename){
  if(/package\.json$/.test(filename)) return filename;

  debug('Looking for the package manifest of %s', filename);

  var dirs = parents(/^\//.test(filename) ? filename : path.join(process.cwd(), path.dirname(filename))),
      maybe, found;

  found = dirs.some(function(dir){
    maybe = path.join(dir, 'package.json');
    debug('Checking if %s exists', maybe);
    return exists(maybe);
  });

  return found ? maybe : undefined;
}

function readManifest(filename){
  var manifest = filename,
      parsed;

  if ( ! /package\.json$/.test(manifest) && ! /component\.json$/.test(manifest) ) {
    debug('Finding manifest of %s', manifest);

    manifest = findManifest(filename);

    if( !manifest ){
      debug('Unable to find the package manifest of %s', filename);
      return undefined;
    }
  }

  debug('Reading manifest at %s', manifest);

  parsed = JSON.parse( readFile(manifest) );
  parsed.at = manifest;

  return parsed;
}
