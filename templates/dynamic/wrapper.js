var {{ name }} = (function(){

  var pkgmap        = {},
      global        = {},
      nativeRequire = typeof require != 'undefined' && require,
      lib, ties, main, async;

  function exports(){ return main(); };

  exports.main     = exports;
  exports.module   = module;
  exports.packages = pkgmap;
  exports.pkg      = pkg;
  exports.require  = function require(uri){
    return pkgmap.main.index.require(uri);
  };

  {{#debug}}
  exports.debug    = true;
  {{/debug}}

  {{#ties}}
  ties             = {{{ ties }}};
  {{/ties}}

  {{#aliases}}
  aliases          = {{{ aliases }}};
  {{/aliases}}

  {{#async}}
  async            = {{{ async }}};

  exports.require.async = function(){
    return pkgmap.main.index.require.async.apply(null, arguments);
  };
  {{/async}}

  return exports;

{{{require}}}

{{{registry}}}

}(this));

{{{packages}}}

if(typeof module != 'undefined' && module.exports ){
  module.exports = {{ name }};

  if( !module.parent ){
    {{ name }}();
  }
}

if(typeof window != 'undefined' && typeof require == 'undefined'){
  window.require = {{name}}.require;
}
