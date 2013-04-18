var pkg        = require('../package'),

    dynamic    = require("./dynamic"),
    statik     = require("./static"),
    plain      = require('./plain'),
    flatten    = require('./flatten'),
    objectName = require('./object_name');

function main(pkg, options, callback){
  var layout = dynamic;

  var async = {},
      hasAsync = false;

  var key;
  for(key in options.save){
    if(key != pkg.name){
      async[key] = options.save[key].url;
      hasAsync = true;
    }
  }

  options.async    = async;
  options.hasAsync = hasAsync;

  layout(pkg, options, function(error, sourceCode){
    callback(error, sourceCode, pkg);
  });
}

module.exports                = main;
module.exports.dynamic        = dynamic;
module.exports.statik         = statik;
module.exports.plain          = plain;
module.exports.flattenPkgTree = flatten;
module.exports.objectName     = objectName;
