var readFile       = require('fs').readFile,
    map            = require('functools').map.async,

    logging        = require('../../logging'),
    flattenPkgTree = require('../flatten'),
    objectName     = require('../object_name'),

    npmpackage     = require('./package'),
    wrapper        = require('./wrapper'),

    templates      = require('./templates');

function dynamic(pkg, options, callback){
  logging.info('Rendering %s', pkg.name);

  var treeName = objectName(pkg.name),
      tree     = flattenPkgTree(pkg).sort(sort),
      output   = {};

  var mainTarget = options.save[pkg.name].to;

  tree.forEach(function(p){
    var target = options.save[p.name] && options.save[p.name].to, parent;

    if(!target){
      if(p.parents.length > 1){
        target = mainTarget;
      } else if(p.parents.length == 1){
        parent = p.parents[0];
        while(parent){
          if(parent.parents.length > 1){
            target = mainTarget;
            break;
          } else if(parent.parents.length == 0){
            target = mainTarget;
            break;
          }

          if(options.save[parent.name] && options.save[parent.name].to){
            target = options.save[parent.name].to;
            break;
          }

          parent = parent.parents[0];
        }
      }
    }

    output[target] || ( output[target] = [] );
    output[target].push(p);
  });

  map(npmpackage.bind(undefined, treeName, options), tree, function(error, packages){
    if(error){
      callback(error);
      return;
    }

    logging.info('All packages has been built. Rendering the output now...');

    wrapper(pkg, treeName, packages.join('\n\n\n\n'), options, callback);
  });
}

function sort(a, b){
  return a.name.localeCompare(b.name);
}

module.exports = dynamic;
module.exports.flattenPkgTree = flattenPkgTree;
