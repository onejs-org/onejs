var path       = require('path'),
    fs         = require('fs'),
    puts       = require('util').puts,
    each       = require('functools').each.async,

    pkg        = require('./package'),
    templating = require('./templating'),

    debug      = require('./debug')('index'),
    targets    = require('./targets'),

    manifest   = require('./manifest'),
    npmignore  = require('./npmignore');

var slice = Array.prototype.slice;

module.exports              = function(){
  return require('./chaining').apply(null, arguments);
};

module.exports.main         = main;
module.exports.build        = build;
module.exports.dependencies = require('./dependencies');
module.exports.id           = require('./id');
module.exports.pkg          = pkg;
module.exports.npmignore    = npmignore;
module.exports.manifest     = manifest;
module.exports.modules      = require('./modules');
module.exports.save         = save;
module.exports.targets      = targets;
module.exports.templating   = templating;

function build(pkg, buildOptions, callback){
  templating(pkg, buildOptions, callback);
}

function buildAndSave(pkg, options, callback){
  build(pkg, options, function(error, bundle){
    if(error) return callback(error);

    if(options.callback) {

      if( Object.keys(bundle).length == 1
          && bundle['[stdout]'] ) return callback(undefined, bundle['[stdout]']);

      return callback(undefined, bundle);
    }

    var output = bundle['[stdout]'];

    var filenames = Object.keys(bundle).filter(function(filename){
      return filename != '[stdout]';
    });

    function iter(filename, callback){
      debug('Saving %s', filename);
      save(filename, bundle[filename], callback);
    }

    each(iter, filenames, function(error){
      if(error) return callback(error);

      if(output){
        puts(output);
      };

      callback();
    });

  });
}

function main(manifestPath, buildOptions, callback){
  var pkgOptions = { manifestPath: manifestPath };

  readNPMIgnore(pkgOptions, buildOptions, function(error, toIgnore){
    toIgnore && ( pkgOptions.ignore = toIgnore );

    pkg(pkgOptions, buildOptions, function(error, loadedPkg){
      if(error) return callback(error);

      buildOptions.save = targets(loadedPkg, pkgOptions, buildOptions);

      buildAndSave(loadedPkg, buildOptions, callback);
    });

  });
}

function readNPMIgnore(pkgOptions, buildOptions, callback){

  if( buildOptions.ignore ){
    callback(undefined, buildOptions.ignore);
    return;
  }

  npmignore(path.dirname(pkgOptions.manifestPath), function(error, toIgnore){

    if(error){
      debug('Failed to read .npmignore');
      callback();
      return;
    }

    callback(undefined, toIgnore);

  });

}

function save(target, content, callback){
  debug('Saving output into ' + target);

  fs.writeFile(target, content, function(error) {
    if(error) {
      debug('Failed to write the target file "'+target+'"');
      callback(error);
      return;
    }

    debug('The target file "'+target+'" was saved!');
    callback();
  });
}
