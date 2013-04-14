var path       = require('path'),
    fs         = require('fs'),
    puts       = require('util').puts,
    each       = require('functools').each.async,

    pkg        = require('./package'),
    templating = require('./templating'),

    logging    = require('./logging'),
    server     = require('./server'),
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
module.exports.logging      = logging;
module.exports.quiet        = quiet;
module.exports.publish      = publish;
module.exports.save         = save;
module.exports.targets      = targets;
module.exports.templating   = templating;
module.exports.verbose      = verbose;
module.exports.verbosity    = verbosity;

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
      logging.info('Saving %s', filename);
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
      logging.warn('Failed to read .npmignore');
      callback();
      return;
    }

    callback(undefined, toIgnore);

  });

}

function quiet(y){
  logging.setLevel('ERROR');
}

function save(target, content, callback){
  logging.debug('Saving output into ' + target);

  fs.writeFile(target, content, function(error) {
    if(error) {
      logging.error('Failed to write the target file "'+target+'"');
      callback(error);
      return;
    }

    logging.info('The target file "'+target+'" was saved!');
    callback();
  });
}

function publish(options){
  options.returnPackage = true;
  build(options, function(error, built, pkg){
    if(error) throw error;
    options.content = built;
    options.pkg = pkg;
    server.start(options);
  });
}

function verbose(){
  logging.setLevel('TRACE');
}

function verbosity(level){
  logging.setLevel(level);
}
