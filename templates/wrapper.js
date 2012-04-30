var {{ name }} = (function(global, undefined){

  var pkgmap        = {},
      global        = {},
      lib           = undefined,
      nativeRequire = typeof require != 'undefined' && require,
      locals;

  {{>library}}

  function findPkg(workingPkg, uri){
    var pkg = undefined,
        parent = workingPkg;
    
    var i, len;
    do {
      i = parent.dependencies.length;
      while(i-->0){
        parent.dependencies[i].name == uri && ( pkg = parent.dependencies[i] );
      }

      parent = parent.parent;
    } while(!pkg && parent);

    
    return pkg;
  }

  function findModule(workingModule, uri){
    var module = undefined,
        moduleId = lib.path.join(lib.path.dirname(workingModule.id), uri).replace(/\.js$/, ''),
        moduleIndexId = lib.path.join(moduleId, 'index'),
        pkg = workingModule.pkg;

    var i = pkg.modules.length,
        id;

    while(i-->0){
      id = pkg.modules[i].id;
      if(id==moduleId || id == moduleIndexId){
        module = pkg.modules[i];
        break;
      }
    }

    return module;
  }

  function genRequire(callingModule){
    return function require(uri){
      var module,
          pkg;

      if(/^\./.test(uri)){
        module = findModule(callingModule, uri); 
      } else {
        pkg = findPkg(callingModule.pkg, uri);

        if(!pkg && nativeRequire){
          try {
            pkg = nativeRequire(uri);
          } catch (nativeRequireError) {}

          if(pkg) return pkg;
        }

        if(!pkg){
          throw new Error('Cannot find module "'+uri+'" @[module: '+callingModule.id+' package: '+callingModule.pkg.name+']');
        }

        module = pkg.main;
      }

      if(!module){
        throw new Error('Cannot find module "'+uri+'" @[module: '+callingModule.id+' package: '+callingModule.pkg.name+']');
      }

      return module.call();
    };
  }

  function module(parentId, wrapper){
    var parent = pkgmap[parentId],
        mod = wrapper(parent),
        cached = false;

    mod.exports = {};
    mod.require = genRequire(mod);

    mod.call = function(){
      if(cached) {
        return mod.exports;
      }
      cached = true;
      global.require = mod.require;
      mod.wrapper(mod, mod.exports, global, global.Buffer, global.process, global.require);
      return mod.exports;
    };

    if(parent.mainModuleId == mod.id){ 
      parent.main = mod;
      !parent.parent && ( locals.main = mod.call );
    }

    parent.modules.push(mod);
  }

  function pkg(parentId, wrapper){
    
    var parent = pkgmap[parentId],
        ctx = wrapper(parent);

    pkgmap[ctx.id] = ctx;
    !parent && ( pkgmap['main'] = ctx );

    parent && parent.dependencies.push(ctx);
  }

  function mainRequire(uri){
    return pkgmap.main.main.require(uri);
  }
  
  function stderr(){
    return lib.process.stderr.content;
  }
  
  function stdin(){
    return lib.process.stdin.content;
  }

  function stdout(){
    return lib.process.stdout.content;
  }

  return (locals = {
    'lib':lib,
    'findPkg':findPkg,
    'findModule':findModule,
    'name':'{{ name }}',
    'map':pkgmap,
    'module':module,
    'pkg':pkg,
    'stderr':stderr,
    'stdin':stdin,
    'stdout':stdout,
    'require':mainRequire
  });

})(this);

{{>packages}}

if(typeof module != 'undefined' && module.exports ){
  module.exports = {{ name }};

  if( !module.parent ){
    {{ name }}.main();
  }

};
