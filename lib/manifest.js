var boxcars = require('boxcars'),
    path    = require('path'),
    fs      = require("fs"),
    logging = require('./logging');

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

  process.env.NVM_PATH &&
    result.push( path.join(process.env.NVM_PATH, '../node_modules') );

  console.log(result);

  return result;
}

function find(packageName, workingdir, callback){

  var found, filename;

  logging.debug('Searching for the manifest file of package "%s" under "%s"', packageName, workingdir);

  console.log(workingdir);

  found = paths(packageName, workingdir).some(function(dir){

    filename = path.join(dir, packageName, '/package.json');

    if(fs.existsSync(filename)){
      callback(undefined, filename);
      return true;
    }

  });

  if(!found){
    logging.error('Failed to find package "%s"', packageName);
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
  logging.debug('Reading the manifest @ "%s"', filename);

  var manifest;

  boxcars(filename)(function(error, bf){

    if(error){
      logging.error('Failed to read the file "%s"', filename);
      callback(error);
      return;
    }

    logging.debug('Parsing the manifest @ "%s"', filename);

    try {

      manifest = JSON.parse(bf);
      logging.trace('Manifest file "%s" loaded and parsed successfully.', filename);

    } catch(exc) {

      logging.error('Failed to parse the manifest @ "%s"', filename);
      error = exc;

    }

    callback(error, fix(manifest));

  });

}

module.exports = read;
module.exports.find = find;
