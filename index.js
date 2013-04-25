var log           = require('./lib/debug')('api'),
    fs            = require('fs'),
    newChain      = require('new-chain'),
    options       = require('./lib/options'),
    newModule     = require('./lib/module'),
    newDependency = require('./lib/dependency');

module.exports = one;

function one(entry){
  var chain = newChain(options.set.debug, options.set.global, options.set.ignore, options.set.require, save, options.set.tie),
      pack  = ( /\.js$/.test(entry) ? newModule : newDependency )( entry );

  if(!pack) return undefined;

  chain.render = render;

  log('Initialized at %s', entry);

  return chain;

  function render(){
    return pack.render();
  }

  function save(target){
    fs.writeFileSync(target, render());
    log('Output written into %s.', target);
  }

}
