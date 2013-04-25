var debug     = require("./debug")('render'),
    uniques   = require('uniques'),
    format    = require('new-format'),
    options   = require('./options'),
    templates = require('./templates');

module.exports = render;
module.exports.renderModule = renderModule;

function allDependenciesOf(module, coll){

  if( ! coll ){
    coll = [];
    coll.lock = {};
    coll.toString = function(){
      return coll.map(nameOf).join(', ');
    };
  }

  if(coll.lock[module.filename]) return;
  coll.lock[module.filename] = true;

  debug('Collecting dependencies of %s. (Coll: %s)', module, coll);

  module.dependencies.forEach(function(pack){
    if( ~ coll.indexOf(pack) || ~ options.ignore.indexOf(pack.name) ) return undefined;

    coll.push(pack);
    allDependenciesOf(pack.main, coll);
  });

  module.relatives.forEach(function(m){
    allDependenciesOf(m, coll);
  });

  coll = uniques(coll);

  debug('Returning dependencies of %s as following; %s', module, coll);

  return coll;
}

function isNotNil(o){
  return !!o;
}

function mapOf(module){
  return module.map;
}

function nameOf(module){
  return module.name;
}

function render(module){

  options.require.forEach(function(uri){
    module.requires.push(uri);
  });

  options.require.length && module.init();

  options.native() && module.init();

  return format(templates.wrapper, {
    entry                : module.id,
    map                  : renderModules(module),
    require              : renderRequire,
    'global-require'     : options.global() ? renderGlobalRequire() : '',
    'native-require'     : options.native() ? ', require' : '',
    'native-require-def' : options.native() ? 'require.nt = arguments[1];' : ''
  });
}

function renderDependenciesOf(module){
  return allDependenciesOf(module).map(renderPack).filter(isNotNil);
}

function renderGlobalRequire(){
  return format(templates.globalRequire, { 'if-not-found': renderIfNotFound });
}

function renderIfNotFound(){
  return templates[ !options.native() ? 'ifNotFound' : 'nativeIfNotFound' ];
}

function renderJSONModule(module){
  return format(templates.jsonModule, { id: module.id, content: module.content });
}

function renderRelativesOf(module){
  return module.relatives.map(renderModule).filter(isNotNil);
}

function renderModule(module){
  if( ~ renderModule.memo.indexOf(module.id) || ~ options.ignore.indexOf(module.filename) ) return undefined;

  renderModule.memo.push(module.id);

  debug('Rendering %s at %s', module.name, module.filename);

  if(module.isJSON) {
    return renderJSONModule(module);
  }

  return format(templates.module, { id: module.id, content: module.content, requires: JSON.stringify(mapOf(module)) });
}

renderModule.memo = [];

renderModule.reset = function reset(){
  renderModule.memo = [];
};

function renderModules(entry, isNotRootEntry){
  var output    = '',
      module    = renderModule(entry),
      relatives = renderRelativesOf(entry),
      packs     = !isNotRootEntry && renderDependenciesOf(entry);

  if(!module) return '';

  debug('Rendering %s and its relatives', entry);

  output += module;

  if(relatives.length){
    output += ',';
    output += relatives.join(',');
  }

  if(!isNotRootEntry && packs.length){
    output += ',';
    output += packs.join(',');
  }

  return output;
}

function renderNativeRequire(){
  return options.native() ? templates.nativeRequire : '';
}


function renderPack(pack){
  debug('Rendering package named "%s"', pack.name);
  return renderModules(pack.main, true);
}

function renderRequire(){
  return format(templates.require, { 'if-not-found': renderIfNotFound });
}
