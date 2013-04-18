var path         = require('path'),
    assert       = require('assert'),
    fs           = require('fs'),
    compose      = require('functools').compose,

    debug        = require('./debug')('package'),
    id           = require('./id'),
    manifest     = require('./manifest'),
    modules      = require('./modules'),
    dependencies = require('./dependencies');

function construct(context, callback){

  assert.ok(context.manifest);
  assert.ok(context.wd);

  var parents = !context.parents || !context.parents.length ? [] : context.parents;

  !context.parents && context.parent && parents.push( context.parent );

  var struct = {
    'id'           : context.manifest.name,
    'dependencies' : undefined,
    'dirs'         : context.manifest.directories || {},
    'ignore'       : context.ignore,
    'main'         : undefined,
    'manifest'     : context.manifest,
    'modules'      : undefined,
    'modulesDict'  : {},
    'name'         : context.manifest.name,
    'parents'      : parents,
    'pkgdict'      : parents.length ? parents[0].pkgdict : {},
    'wd'           : context.wd
  };

  struct.pkgdict[struct.name] = struct;

  callback(undefined, struct);
}

function loadDependencies(params, callback){
  var pkg = params.pkg, options = params.options;

  debug('Loading dependencies of %s', pkg.name);

  dependencies(pkg, options, function(error, deps){

    if(error){
      debug('An unexpected error occurred during collecting dependencies of the package "%s".', pkg.name);
      debug(error);
      callback(error);
      return;
    }

    debug('%d dependencies has been loaded for the package "%s"', deps.length, pkg.name);

    pkg.dependencies = deps;

    callback(undefined, params);
  });
}

function loadModules(params, callback){
  var pkg = params.pkg, options = params.options;

  modules(pkg, options, function(error, modules){

    if(error){
      debug('An unexpected error occurred during collecting modules of the package "%s".', pkg.name);
      debug(error);
      callback(error);
      return;
    }

    debug('Collected %d modules for the package "%s"', modules.length, pkg.name);

    pkg.modules = modules;

    var i = modules.length, m;

    while(i-->0){
      m = modules[i];
      pkg.modulesDict[m.path] = m;
    }

    callback(undefined, params);
  });
}

function setMainModule(params, callback){
  var pkg = params.pkg, options = params.options, errormsg;

  if( ! pkg.manifest.main ){
    return callback(undefined, pkg, options);
  }

  debug('Setting main module of the package "%s" as %s', pkg.name, pkg.manifest.main);

  var absolutePath = path.join(pkg.wd, pkg.manifest.main );

  fs.stat(absolutePath, function(error, stat){

    var isDirectory = stat && stat.isDirectory(),
        hasJSExt = /\.js$/.test(pkg.manifest.main),

        resolvedPath = isDirectory ? path.join( absolutePath, 'index.js') : hasJSExt ? absolutePath : absolutePath + '.js';

    pkg.main = pkg.modulesDict[resolvedPath];

    if( pkg.main ){
      pkg.mainModuleId = pkg.main.name;

      callback(undefined, params);
    } else {
      errormsg = 'Failed to find main module of "' + pkg.name + '". Resolved Path: "' + resolvedPath + '" Manifest Definition: "' + pkg.manifest.main + '"';

      debug(errormsg);
      callback(new Error(errormsg));
    }

  });
}

function content(pkg, options, callback){
  debug('Loading the package "%s"', pkg.manifest.name);

  compose.async(loadDependencies, loadModules, setMainModule)({ 'pkg': pkg, 'options': options }, function(error){
    if(error){
      callback(error);
      return;
    }

    debug('%s loaded.', pkg.name);
    callback(undefined, pkg);

  });
}

function main(options, buildOptions, callback){

  var manifestPath;

  typeof options == 'string'
    && ( manifestPath = options, options = { 'manifestPath': manifestPath } )
    || ( manifestPath = options.manifestPath );

  debug('Building the package at "%s"', manifestPath);

  manifest(manifestPath, function(error, manifestObj){

    if(error){
      callback(error);
      return;
    }

    var constructOptions = {
      'manifest': manifestObj,
      'ignore':options.ignore,
      'wd': path.normalize(path.dirname(manifestPath)),
      'parents': options.parents,
      'parent': options.parent
    };

    construct(constructOptions, function(error, pkgobj){
      if(error){
        callback(error);
        return;
      }

      if(pkgobj.parents.length == 0){
        buildOptions.rootPackage = pkgobj;
      }

      content(pkgobj, buildOptions, callback);

    });

  });
}

module.exports = main;
module.exports.id = id();
module.exports.content = content;
module.exports.construct = construct;
