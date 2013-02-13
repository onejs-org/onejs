module.exports = function(options){
  var result = options.exclude || [];

  options.rootPackage &&
    options.rootPackage.manifest.web &&
    options.rootPackage.manifest.web.exclude &&
    options.rootPackage.manifest.web.exclude.forEach(function(el){
      result.push(el);
    });

   return result;
};
