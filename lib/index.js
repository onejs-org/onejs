var path       = require('path'),
    fs         = require('fs'),
    pkg        = require('./package'),
    templating = require('./templating'),

    logging    = require('./logging'),
    server     = require('./server'),
    targets    = require('./targets'),

    manifest   = require('./manifest'),
    npmignore  = require('./npmignore');

var slice = Array.prototype.slice;

module.exports = main;
module.exports.build = build;
module.exports.dependencies = require('./dependencies');
module.exports.id = require('./id');
module.exports.pkg = pkg;
module.exports.npmignore = npmignore;
module.exports.manifest = manifest;
module.exports.modules = require('./modules');
module.exports.logging = logging;
module.exports.quiet = quiet;
module.exports.publish = publish;
module.exports.save = save;
module.exports.targets = targets;
module.exports.templating = templating;
module.exports.verbose = verbose;
module.exports.verbosity = verbosity;

function build(pkg, buildOptions, callback){
  templating(pkg, buildOptions, callback);
}

function buildAndSave(pkg, options, callback){
  build(pkg, options, function(error, bundle){
    if(error) return callback(error);

    var target =  options.save[pkg.name] && options.save[pkg.name].to || undefined;

    if(!target) return callback(null, null, bundle);

    save(target, bundle, function(error){
      if(error) return callback(error);

      callback(null, target, bundle);
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
