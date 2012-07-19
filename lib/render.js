var readFile   = require('fs').readFile,
    logging    = require('./logging'),
    templating = require('./templating'),
    functools  = require('functools'),

    map        = functools.map.async,
    juxt       = functools.juxt.async;

var templates = templating.collection('wrapper.js', 'package.js', 'module.js', 'console.js', 'library.js', 'path.js', 'process.js'),
    render = templating.render(templates);

function flattenPkgTree(tree){
  var pkgs = [],
      key;

  for(key in tree.pkgdict){
    pkgs.push( tree.pkgdict[ key ] );
  }

  return pkgs;
}

function sandboxConsole(options, callback){
  logging.trace('Rendering console template');
  render('console', callback);
}

function env(options){
  var result, key;

  if(options.debug){
    result = {};
    for(key in process.env){
      result[ key ] = process.env[ key ].replace(/"/g, '\'');
    }
  }

  return JSON.stringify(result);
}

function library(options, callback){
  logging.trace('Rendering library template...');

  var view = {}, partials = {};

  view.debug = options.debug;
  view.version = '1.6.0'; // FIXME
  view.versions = '{}';
  view.env = env(options);
  view.sandboxConsole = options.sandboxConsole;
  view.include_process = options.includeProcess;

  juxt({ 'path':path, 'process':processtmpl, 'console': sandboxConsole })(options, function(error, partials){

    if(error){
      callback(error);
      return;
    }

    render({ 'template': 'library', 'view': view, 'partials': partials }, callback);

  });
}

function main(pkg, options, callback){
  logging.trace('Rendering...');

  options.includeProcess = !options.noprocess;

  templates(function(error, buffers){
    if(error){
      callback(error);
      return;
    }

    var treeName = templating.makeVariableName(pkg.name),
        pkgs     = flattenPkgTree(pkg),
        sortedPkgs = pkgs.sort(function(a, b){
          return a.name.localeCompare(b.name);
        });

    map( npmpackage.bind(undefined, treeName, options), sortedPkgs, function(error, packages){
      if(error){
        callback(error);
        return;
      }

      logging.info('All packages has been built. Rendering the output now...');

      wrapper(treeName, packages.join('\n\n\n\n'), options, callback);

    });

  });
}

function npmpackage(treeName, options, pkg, callback){
  logging.debug('Building package "'+pkg.name+'"');

  var view = {
    'treeName': treeName,
    'hasParent': pkg.parents.length > 0,
    'parentIds': pkg.parents.map(function(el){ return el.id; }).join(', '),
    'id': pkg.id,
    'main': pkg.main && pkg.main.id,
    'name': pkg.name,
    'wd': pkg.wd
  };

  var partials      = {},
      modules       = pkg.modules,
      sortedModules = modules.sort(function(a, b){
        return a.filename.localeCompare(b.filename);
      });

  map( npmmodule.bind(undefined, pkg, treeName, options), sortedModules, function(error, modules){

    if(error) {
      callback(error);
      return;
    }

    partials.modules = modules.join('\n\n');

    render({ 'template':'package', 'view': view, 'partials': partials }, callback);

  });

}

function npmmodule(pkg, treeName, options, module, callback){

  logging.debug('Building module "'+module.id+'"');

  var view = {
    'treeName': treeName,
    'parentId': pkg.id,
    'id': module.id,
    'sandbox_console': options.sandboxConsole,
    'include_process': options.includeProcess
  };

  var partials = {
    'content': module.content
  };

  render({ template: 'module', 'view': view, 'partials': partials }, callback);
}

function path(options, callback){
  logging.trace('Rendering path template.');
  render('path', callback);
}

function processtmpl(options, callback){
  logging.trace('Rendering process template');

  var view = {
    'env': env(options),
    'debug': options.debug,
    'version': '1.7.5',
    'versions': '{ one: "1.7.5" }'
  };

  render({ template: 'process', view: view }, callback);
}

function ties(options){

  if(!options.tie){
    return undefined;
  }

  var output = '{', key,
      i      = options.tie.length,
      comma  = '',
      tie;

  while( i -- ){
    tie = options.tie[i];
    output += comma + '"'+ ( tie.pkg || tie.module ) + '": ' + ( tie.obj || tie.to );
    comma = ', ';
  }

  output += '}';

  return output;
};

function wrapper(treeName, packages, options, callback){
  logging.trace('Rendering wrapper template...');

  var view = {}, partials = {};

  view.name             = treeName;
  view.debug           = options.debug;
  view.ties            = ties(options);
  view.sandbox_console = options.sandboxConsole;
  view.include_process = options.includeProcess;

  library(options, function(error, renderedLibrary){
    if(error){
      callback(error);
      return;
    }

    partials.library = renderedLibrary;
    partials.packages = packages;

    render({
      'template': 'wrapper',
      'view': view,
      'partials': partials
    }, callback);

  });
}


main.flattenPkgTree = flattenPkgTree;
module.exports = main;
