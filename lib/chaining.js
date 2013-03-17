var modules = require('./modules'),
    index   = require('./index'),
    main    = index.main;

module.exports = chaining;

function chaining(manifest){
  var chain = {
    alias: alias,
    devDependencies: devDependencies,
    exclude: exclude,
    filter: filter,
    include: include,
    save: save,
    tie: tie,
    quiet: quiet
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

  function devDependencies(){
    options.devDependencies = true;
    return chain;
  }

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

  function include(fiename){
    modules.toInclude.push.apply(modules.toInclude, arguments);
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

  function quiet(){
    index.quiet();
    return chain;
  }


  return chain;
}
