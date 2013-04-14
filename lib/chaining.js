var modules = require('./modules'),
    index   = require('./index'),
    main    = index.main;

module.exports = chaining;

function chaining(manifest){
  var chain = {
    alias           : alias,
    debug           : debug,
    dependency      : dependency,
    devDependencies : devDependencies,
    exclude         : exclude,
    filter          : filter,
    include         : include,
    name            : name,
    save            : save,
    tie             : tie,
    quiet           : quiet
  };

  var options = {
    alias   : [],
    exclude : [],
    tie     : []
  };

  function alias(name, orig){
    options.alias.push({ name: name, orig: orig });
    return chain;
  };

  function debug(){
    options.debug = true;
    return chain;
  }

  function dependency(name, version){
    options.addDeps || (options.addDeps = {});
    options.addDeps[name] = version;
    return chain;
  }

  function devDependencies(){
    options.devDependencies = true;
    return chain;
  }

  function exclude(pkg){
    options.exclude.push.apply(options.exclude, arguments);
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

  function name(bundleName){
    options.bundleName = bundleName;
    return chain;
  }

  function tie(module, to){
    options.tie.push({ module: module, to: to });
    return chain;
  };

  function save(/* [filename,] callback */){
    var callback;

    if( typeof arguments[0] == 'string' ) {
      options.target = arguments[0];
      callback = arguments[1];
    } else {
      callback = options.callback = arguments[0];
    }

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
