function module(parent, id, wrapper){
  var mod    = { pkg: parent, id: id, wrapper: wrapper },
      cached = false;

  mod.exports = {};
  mod.require = newRequire(mod);

  mod.call = function(){
    if(cached) {
      return mod.exports;
    }

    cached = true;

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
      ctx     = wrapper(parents);

  {{#debug}}
  if(pkgmap.hasOwnProperty(ctx.name)) throw new Error(ctx.name + 'is duplicating itself.');
  {{/debug}}

  pkgmap[ctx.name] = ctx;

  arguments.length == 1 && ( pkgmap.main = ctx );

  return function(modules){
    var id;
    for(id in modules){
      module(ctx, id, modules[id]);
    }
  };
}
