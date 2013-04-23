var debug     = require("./debug")('render'),
    uniques   = require('uniques'),
    format    = require('new-format'),
    templates = require('./templates');

module.exports = render;

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
    if( ~ coll.indexOf(pack) ) return;

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
  return format(templates.wrapper, { entry: module.id, map: renderModules(module), require: renderRequire });
}

function renderDependenciesOf(module){
  return allDependenciesOf(module).map(renderPack).filter(isNotNil);
}

function renderRelativesOf(module){
  return module.relatives.map(renderModule).filter(isNotNil);
}

function renderModule(module){
  if( ~ renderModule.memo.indexOf(module.id) ) return undefined;

  renderModule.memo.push(module.id);

  return format(templates.module, { id: module.id, content: module.content, requires: JSON.stringify(mapOf(module)) });
}

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

function renderPack(pack){
  debug('Rendering package %s', pack.name);
  return renderModules(pack.main, true);
}

function renderRequire(){
  return templates.require;
}

renderModule.memo = [];
