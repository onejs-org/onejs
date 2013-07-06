var debug       = require("./debug")('find'),
    componentAt = require('./component-at'),
    parents     = require('parents'),
    exists      = require('fs').existsSync,
    path        = require("path");

module.exports = find;

function find(parent, pack){
  var start = path.dirname(parent.filename);

  if( ! /^\//.test(start) ){
    start = path.join(process.cwd(), start);
  }

  debug('Looking for %s starting from %s', pack, start);

  var dirs = parents(start),
      maybe, result, found;

  if ( parent.component && parent.component.dependencies[pack] ) {
    debug('Package "%s" renamed to "%s"', pack, parent.component.dependencies[pack]);
    pack = parent.component.dependencies[pack];
  }

  found = dirs.some(function(dir){
    maybe = path.join(dir, 'node_modules', pack, 'package.json');
    result = exists(maybe);

    if ( parent.component && !result ) {
      maybe = path.join(dir, 'components', pack, 'component.json');
      result = exists(maybe);
    }

    return result;
  });

  if(!found){
    debug('Unable to find %s', pack);
  } else {
    debug('%s found at %s', pack, maybe);
  }

  return found ? maybe : undefined;
}
