var debug = require('./debug')('chaining'),
    modules = require('./modules'),
    index   = require('./index'),
    main    = index.main;

module.exports = chaining;

function chaining(manifest){
  var chain = {
    alias           : alias,
    debug           : enableDebug,
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

  debug('Manifest: %s', manifest);

  function alias(name, orig){
    debug('Registering new alias for %s: %s', orig, name);
    options.alias.push({ name: name, orig: orig });
    return chain;
  };

  function enableDebug(){
    debug('SourceUrls enabled');
    options.debug = true;
    return chain;
  }

  function dependency(name, version){
    if(!name) return;

    debug('Added new dependency %s v%s', name, version);
    options.addDeps || (options.addDeps = {});
    options.addDeps[name] = version;
    return chain;
  }

  function devDependencies(){
    debug('Enabled devDependencies');
    options.devDependencies = true;
    return chain;
  }

  function exclude(pkg){
    debug('%s will be excluded', Array.prototype.join.call(arguments, ','));
    options.exclude.push.apply(options.exclude, arguments);
    return chain;
  }

  function filter(regex){
    debug('%s will be filtered', regex);

    modules.filters.push(function(filename){
      return !regex.test(filename);
    });

    return chain;
  }

  function include(){
    debug('%s will be included to the bundle', Array.prototype.join.call(arguments, ','));

    modules.toInclude.push.apply(modules.toInclude, arguments);
    return chain;
  }

  function name(bundleName){
    debug('Bundle renamed to %s', bundleName);

    options.bundleName = bundleName;
    return chain;
  }

  function tie(module, to){
    debug('%s tied to %s', module, to);

    options.tie.push({ module: module, to: to });
    return chain;
  };

  function save(/* [filename,] callback */){

    var callback;

    if( typeof arguments[0] == 'string' ) {
      options.target = arguments[0];
      callback = arguments[1];
    } else if(typeof arguments[0] == 'function') {
      callback = options.callback = arguments[0];
    }

    options.target && debug('Saving to %s', options.target);

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
