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

  debug('Looking for %s starting from %s', pack, start, parent.component ? ' [component]' : '');

  var dirs = parents(start),
      maybe, result, found;

  found = dirs.some(function(dir){
    maybe = path.join(dir, 'node_modules', pack, 'package.json');
    result = exists(maybe);
    return result;
  });

  if(!found && parent.pack && parent.pack.component && parent.pack.component.dependencies[pack]){
    debug('Package "%s" renamed to "%s"', pack, parent.pack.component.dependencies[pack]);
    pack = parent.pack.component.dependencies[pack];

    found = dirs.some(function(dir){
      maybe = path.join(dir, 'node_modules', pack, 'package.json');
      result = exists(maybe);

      if ( parent.pack.component && !result ) {
        maybe = path.join(dir, 'components', pack, 'component.json');
        result = exists(maybe);
      }

      return result;
    });
  }

  if(!found){
    debug('Unable to find %s', pack);
  } else {
    debug('%s found at %s', pack, maybe);
  }

  return found ? maybe : undefined;
}
