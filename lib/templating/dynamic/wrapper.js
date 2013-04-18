var debug      = require('../../debug')('dynamic/wrapper'),
    ownrequire = require('./require'),
    registry   = require('./registry'),
    templates  = require('./templates'),
    ties       = require('../../ties'),
    aliases    = require('../../aliases');

function renderAliases(aliases){
  return JSON.stringify(aliases);
};

function renderTies(ties){
   var output = '{',
       key, comma = '';

  for(key in ties){
    output += comma + '"' + key + '": ' + ties[key];
    comma = ', ';
  }

  output += '}';

  return output;
};

function wrapper(pkg, treeName, renderedPackages, options, callback){
  debug('Rendering wrapper template...');

  var partials    = {},
      views       = {
        'name'    : treeName,
        'debug'   : options.debug,
        'ties'    : renderTies(ties(pkg, options)),
        'aliases' : renderAliases(aliases(pkg, options))
      };

  ownrequire(options, function(error, renderedRequire){
    if(error){
      callback(error);
      return;
    }

    registry(options, function(error, renderedRegistry){
      if(error){
        callback(error);
        return;
      }

      views.packages = renderedPackages;
      views.require  = renderedRequire;
      views.registry = renderedRegistry;
      options.hasAsync && (views.async  = JSON.stringify(options.async));

      templates.wrapper(views, callback);

    });
  });
}

module.exports = wrapper;
