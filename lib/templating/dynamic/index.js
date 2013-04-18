var readFile       = require('fs').readFile,
    map            = require('functools').map.async,

    debug          = require('../../debug')('dynamic/index'),
    flattenPkgTree = require('../flatten'),
    objectName     = require('../object_name'),
    buildTree      = require('../build_tree'),

    npmpackage     = require('./package'),
    wrapper        = require('./wrapper'),

    templates      = require('./templates');

function dynamic(pkg, options, callback){
  debug('Rendering %s', pkg.name);

  var bundleName = options.bundleName || (pkg.manifest.web && pkg.manifest.web.name) || objectName(pkg.name),
      trees     = buildTree(pkg, options);

  map(renderPackageTree.bind(undefined, options, bundleName), trees, function(error, output){
    debug('All packages has been built. Rendering wrapper now...');

    var mainTarget = options.save[pkg.name].to;

    wrapper(pkg, bundleName, output[mainTarget], options, function(error, rpl){
      if(error) return callback(error);

      output[mainTarget] = rpl;

      callback(undefined, output);
    });
  });

}

function renderPackageTree(options, bundleName, tree, callback){
  map(npmpackage.bind(undefined, bundleName, options), tree, function(error, packages){
    if(error){
      callback(error);
      return;
    }

    callback(undefined, packages.join('\n\n'));
  });
}

module.exports = dynamic;
module.exports.flattenPkgTree = flattenPkgTree;
