var debug     = require('./debug')('modules'),

    flatten   = require('flatten-array'),
    functools = require('functools'),
    compose   = functools.compose,

    glob      = require('glob'),
    path      = require('path'),
    readFile  = require('fs').readFile;

var filters   = [],
    toInclude = [];

module.exports                = modules;
module.exports.filterFilename = filterFilename;
module.exports.loadModule     = loadModule;
module.exports.loadModules    = loadModules;
module.exports.fixname        = fixname;
module.exports.filters        = filters;
module.exports.toInclude      = toInclude;

function filter(filenames, callback){
  var copy = filenames.slice(),
      i = -1, len = filters.length;

  while( ++i < len ){
    try {
      copy = copy.filter( filters[i] );
    } catch( exc ) {
    }
  }

  return copy;
}

function filterFilename(filename){
  return /\.js$/.test(filename);
}

function filterFilenames(filenames, callback){
  return filenames.filter(filterFilename);
}

function filterIgnoredModules(pkg, filenames){
  if(!pkg.ignore) return filenames;

  var f = filenames.length,
      i, ignore, filename,
      ignored, result = [];

  while( f -- ){
    ignored = false;

    i = pkg.ignore.length;
    filename = filenames[f].substring(pkg.wd.length + ( pkg.wd.substring(pkg.wd.length-1) != '/' ? 1 : 0 ));

    while( i -- ){

      ignore = pkg.ignore[i];

      if( filename.substring( 0, ignore.length ) == ignore ){
        debug('Module "%s" is ignored by the line "%s" at .npmignore', filename, ignore);
        ignored = true;
        break;
      }

    }

    !ignored && result.push( filenames[f] );

  }

  return result;

}


function fixname(filename){
  var m = filename.match(/([^\/\.]+)\.js$/);
  return !m ? undefined : m[1];
}

function loadModule(filename, callback){

  debug('Loading module "'+filename+'"');

  readFile(filename, function(error, bf){
    if(error) {
      callback(error);
      return;
    }

    var content = bf.toString(),
        name = fixname(filename);

    if(content.substring(0,2) == '#!'){
      content = content.replace(/\#\!.+\n/, '');
    }

    callback(undefined, {
      'name':name,
      'filename':filename,
      'path':filename,
      'content':content
    });

  });

};

function loadModules(pkg, base, filenames, callback){
  debug('Found '+filenames.length+' file(s) under the package "'+pkg.name+'"');

  var modules = [];

  (function next(i){

    if(i>=filenames.length){
      debug('Loaded %d module(s) under the package "%s"',filenames.length,pkg.name);
      callback(undefined, modules);
      return;
    }

    loadModule(filenames[i], function(error, module){
      if(error){
        debug('Failed to load the module "'+filenames[i]+'"');
        callback(error);
        return;
      }

      //replacing '\' with '/' for Windows based systems
      module.filename = module.filename.replace(/\\/g,'/');
      module.filename = module.filename.replace(base+'/', '');
      module.filename.indexOf('/') > 0 && base != '.' && ( module.filename = module.filename.replace(base, '') );
      module.id = module.filename.replace(/\.js$/,'');


      if(!error) modules.push(module);

      next(i+1);

    });

  })(0);
}

function modules(pkg, options, callback){
  debug('Collect modules for the package "'+pkg.name+'"');

  var dirs = [],
      base = '',
      join = path.join.bind(undefined, pkg.wd),
      lib  = join('lib');

  if(pkg.dirs && pkg.dirs.lib){
    base = join(pkg.dirs.lib);
    dirs.push(base);

  } else if (pkg.manifest.main) {
    base = pkg.wd;

    dirs.indexOf(lib) == -1 && dirs.push(lib);
    dirs.push(join(pkg.manifest.main + ( /\.js$/.test(pkg.manifest.main) ? '' : '.js' )));

  } else {
    base = pkg.wd;
    dirs.push(join('index.js'));
    dirs.push(join('lib'));
  }

  debug('The directories to search:', dirs);

  var files = filterIgnoredModules(pkg, filter(filterFilenames(flatten(dirs.map(function(el){
    return glob.sync(el + '/**/*.js').concat(glob.sync(el));
  })))));

  if(pkg.parents && pkg.parents.length){
    dirs = dirs.concat(toInclude);
  }

  loadModules(pkg, base, files, callback);
}
