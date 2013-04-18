var debug = require('./debug')('manifest'),
    path  = require('path'),
    fs    = require("fs");

function paths(pkg, dir){
  var result = [path.join(dir, 'node_modules')],
      up;

  up = path.join(dir, '../');

  while(fs.existsSync(up)){
    result.push(path.join(up, 'node_modules'));

    if( path.join(process.cwd(), up) == '/'){
      break;
    }

    up = path.join(up, '../');
  }

  return result;
}

function find(packageName, workingdir, callback){

  var found, filename;

  debug('Searching for the manifest file of package "%s" under "%s"', packageName, workingdir);

  found = paths(packageName, workingdir).some(function(dir){

    filename = path.join(dir, packageName, '/package.json');

    if(fs.existsSync(filename)){
      callback(undefined, filename);
      return true;
    }

  });

  if(!found){
    debug('Failed to find package "%s"', packageName);
    return callback(new Error('Failed to find package "' + packageName + '"'));
  }
};

function fix(manifest){

  var lib  = manifest.directories && manifest.directories.lib,
      main = manifest.main;

  if( lib && main && ( main.substring(0, lib.length) != lib && ( './' + main ).substring(0, lib.length) != lib ) ){
    delete manifest.directories.lib;
  }

  return manifest;

}

function read(filename, callback){
  debug('Reading the manifest @ "%s"', filename);

  var manifest;

  fs.readFile(filename, function(error, bf){

    if(error){
      debug('Failed to read the file "%s"', filename);
      callback(error);
      return;
    }

    debug('Parsing the manifest @ "%s"', filename);

    try {
      manifest = JSON.parse(bf.toString());
      debug('Manifest file "%s" loaded and parsed successfully.', filename);
    } catch(exc) {
      debug('Failed to parse the manifest @ "%s"', filename);
      error = exc;
    }

    callback(error, fix(manifest));

  });

}

module.exports = read;
module.exports.find = find;
