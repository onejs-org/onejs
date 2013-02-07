var modules = require('./modules'),
    main    = require('./index').main;

module.exports = chaining;

function chaining(manifest){
  var chain = {
    tie: tie,
    alias: alias,
    exclude: exclude,
    filter: filter,
    save: save
  };

  var options = {
    alias: [],
    exclude: [],
    tie: []
  };

  function alias(name, orig){
    options.alias.push({ name: name, orig: orig });
    return chain;
  };

  function exclude(pkg){
    options.exclude.push(pkg);
    return chain;
  }

  function filter(regex){
    modules.filters.push(function(filename){
      return !regex.test(filename);
    });

    return chain;
  }

  function tie(module, to){
    options.tie.push({ module: module, to: to });
    return chain;
  };

  function save(filename, callback){
    options.target = filename;
    main(manifest, options, callback || function(error){
      if(error) throw error;
    });
  }

  return chain;
}


