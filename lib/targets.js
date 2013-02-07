var path = require("path");

function all(pkg, pkgOptions, buildOptions){
  var manifest = pkg.manifest,
      result = {};

  var key;
  if(manifest.web && manifest.web.save) {
    if(typeof manifest.web.save == 'string'){
      result[manifest.name] = val(manifest.web.save, pkgOptions.manifestPath);
      return result;
    }

    for(key in manifest.web.save){
      result[key] = val(manifest.web.save[key], pkgOptions.manifestPath);
    }
  }

  if(buildOptions.target){
    result[manifest.name] = { to: buildOptions.target };
  } else if(!result[manifest.name]) {
    result[manifest.name] = { to: '[stdout]' };
  }

  return result;
}

function targetPath(manifest, target){
  return path.join(path.dirname(manifest), target);
}

function val(field, manifest){
  if(typeof field == 'string'){
    return { to: targetPath(manifest, field) };
  }

  var ret = { to: targetPath(manifest, field.to) };
  field.url && ( ret.url = field.url );
  return ret;
}

module.exports = all;
