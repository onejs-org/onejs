/*global require:false, module:false */
var {{ name }} = (function(undefined){

  var pkgdefs       = {},
      pkgmap        = {},
      global        = {},
      nativeRequire = typeof require != 'undefined' && require,
      lib, ties, main;

  function exports(){ return main(); };
  exports.module   = module;
  exports.packages = pkgmap;
  exports.pkg      = pkg;
  exports.require  = mainRequire;

  {{#debug}}
  exports.debug    = true;
  {{/debug}}

  {{#ties}}
  ties             = {{{ ties }}};
  {{/ties}}

  {{{library}}}

  return exports;

  function findPkg(uri){
    return pkgmap[uri];
  }

  function findModule(workingModule, uri){
    var module,
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

  function newRequire(callingModule){
    return function require(uri){
      var module,
          pkg;

      if(/^\./.test(uri)){
        module = findModule(callingModule, uri);
      } else if ( ties && ties.hasOwnProperty( uri ) ) {
        return ties[ uri ];
      } else {
        pkg = findPkg(uri);

        if(!pkg && nativeRequire){
          try {
            pkg = nativeRequire(uri);
          } catch (nativeRequireError) {}

          if(pkg) return pkg;
        }

        if(!pkg){
          throw new Error('Cannot find module "'+uri+'" @[module: '+callingModule.id+' package: '+callingModule.pkg.name+']');
        }

        module = pkg.index;
      }

      if(!module){
        throw new Error('Cannot find module "'+uri+'" @[module: '+callingModule.id+' package: '+callingModule.pkg.name+']');
      }

      module.parent = callingModule;
      return module.call();
    };
  }

  function module(parentId, wrapper){
    var parent = pkgdefs[parentId],
        mod = wrapper(parent),
        cached = false;

    mod.exports = {};
    mod.require = newRequire(mod);

    mod.call = function(){
      {{^debug}}
      if(cached) {
        return mod.exports;
      }
      cached = true;
      {{/debug}}
      global.require = mod.require;

      mod.wrapper(mod, mod.exports, global, global.require);
      return mod.exports;
    };

    if(parent.mainModuleId == mod.id){
      parent.index = mod;
      parent.parents.length === 0 && ( main = mod.call );
    }

    parent.modules.push(mod);
  }

  function pkg(/* [ parentId ...], wrapper */){

    var wrapper = arguments[ arguments.length - 1 ],
        parents = Array.prototype.slice.call(arguments, 0, arguments.length - 1),
        ctx = wrapper(parents);

    if(pkgdefs.hasOwnProperty(ctx.id)){
      throw new Error('Package#'+ctx.id+' "' + ctx.name + '" has a duplication of itself.');
    }

    pkgdefs[ctx.id] = ctx;
    pkgmap[ctx.name] = ctx;

    arguments.length == 1 && ( pkgmap.main = ctx );
  }

  function mainRequire(uri){
    return pkgmap.main.index.require(uri);
  }

}(this));

{{{packages}}}

if(typeof module != 'undefined' && module.exports ){
  module.exports = {{ name }};

  if( !module.parent ){
    {{ name }}();
  }

}
