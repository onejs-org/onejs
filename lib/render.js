var debug     = require("./debug")('render'),
    format    = require('new-format'),
    templates = require('./templates');

module.exports = render;

function isNotNil(o){
  return !!o;
}

function mapOf(module){
  var map = {}, key;

  for(key in module.map){
    map[key] = module.map[key].id;
  }

  return map;
}

function render(module){
  return format(templates.wrapper, { map: renderModules(module), require: renderRequire });
}

function renderDependenciesOf(module){
  return module.dependencies.map(renderPack).filter(isNotNil);
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
