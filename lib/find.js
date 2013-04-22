var debug   = require("./debug")('find'),
    parents = require('parents'),
    exists  = require('fs').existsSync,
    path    = require("path");

module.exports = find;

function find(parent, pack){
  var start = path.dirname(parent.filename);

  if( ! /^\//.test(start) ){
    start = path.join(process.cwd(), start);
  }

  debug('Looking for %s starting from %s', pack, start);

  var dirs = parents(start),
      maybe, found;

  found = dirs.some(function(dir){
    maybe = path.join(dir, 'node_modules', pack, 'package.json');
    return exists(maybe) ;
  });

  if(!found){
    debug('Unable to find %s', pack);
  } else {
    debug('%s found at %s', pack, maybe);
  }

  return found ? maybe : undefined;
}
