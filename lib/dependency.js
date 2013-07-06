var debug       = require('./debug')('dependency'),
    componentAt = require('./component-at'),
    newPackage  = require("./package"),
    path        = require("path"),
    fs          = require('fs'),
    manifestOf  = require('./manifest');

module.exports = newDependency;

function isDirectory(filename){
  return fs.existsSync(filename) && fs.statSync(filename).isDirectory();
}

function mainModuleOf(manifest){
  var filename = path.join(path.dirname(manifest.at), manifest.main || 'index.js');

  /\.js$/.test(filename) || ( filename += '.js' );
  isDirectory(filename) && ( path.join(filename, 'index.js') );

  debug('Recognized main module for %s is %s', manifest.name, filename);

  return filename;
}

function newDependency(entry, isEntry){
  debug('Creating new%s dependency from %s', isEntry ? ' entry' : '', entry);

  var manifest = manifestOf(entry),
      pack;

  if ( !manifest ) return;

  pack = newPackage(manifest.name, mainModuleOf(manifest), isEntry);

  return pack;
}
