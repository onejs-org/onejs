var boxcars = require('boxcars'),
    path    = require('path'),
    logging = require('./logging');

function find(packageName, workingdir, callback){
  logging.debug('Searching for the manifest file of package "%s" under "%s"', packageName, workingdir);

  var filename = path.join(workingdir, 'node_modules', packageName, '/package.json');
  path.exists(filename, function(exists){
    if(exists){
      callback(undefined, filename);
      return;
    }

    var up = path.join(workingdir, '../');
    
    if (up === workingdir) {
      // Reached top of the tree, not found. Fail.
      logging.error('Unable to find package', packageName);
      callback(new Error('"' + packageName + '" not found'));
      return;
    }

    if( ( /^\.\.\//.test(up) && up.match(/\.\.\//g).length > process.cwd().match(/\//g).length ) ){
      logging.error('Infinite tree-walk detected.');
      callback(new Error('Failed to find package "'+packageName+'"'));
      return;
    }

    path.exists( up, function(exists){

      if(!exists){
        logging.error('Failed to find package "%s"', packageName);
        callback(new Error('Failed to find package "'+packageName+'"'));
        return;
      }

      find(packageName, up, callback);

    });

  });
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

    callback(error, manifest);

  });

}

module.exports = read;
module.exports.find = find;
