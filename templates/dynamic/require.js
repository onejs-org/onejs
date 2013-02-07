function join() {
  return normalize(Array.prototype.join.call(arguments, "/"));
};

function normalize(path) {
  var ret = [], parts = path.split('/'), cur, prev;

  var i = 0, l = parts.length-1;
  for (; i <= l; i++) {
    cur = parts[i];

    if (cur === "." && prev !== undefined) continue;

    if (cur === ".." && ret.length && prev !== ".." && prev !== "." && prev !== undefined) {
      ret.pop();
      prev = ret.slice(-1)[0];
    } else {
      if (prev === ".") ret.pop();
      ret.push(cur);
      prev = cur;
    }
  }

  return ret.join("/");
};

function dirname(path) {
  return path && path.substr(0, path.lastIndexOf("/")) || ".";
};

function findModule(workingModule, uri){
  var moduleId      = join(dirname(workingModule.id), uri).replace(/\.js$/, ''),
      moduleIndexId = join(moduleId, 'index'),
      pkg           = workingModule.pkg,
      module;

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
    var module, pkg;

    if(/^\./.test(uri)){
      module = findModule(callingModule, uri);
    } else if ( ties && ties.hasOwnProperty( uri ) ) {
      return ties[uri];
    } else if ( aliases && aliases.hasOwnProperty( uri ) ) {
      return require(aliases[uri]);
    } else {
      pkg = pkgmap[uri];

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
