var {{ name }} = (function(){

  var pkgmap        = {},
      global        = {},
      nativeRequire = typeof require != 'undefined' && require,
      lib, ties, main;

  function exports(){ return main(); };

  exports.main     = exports;
  exports.module   = module;
  exports.packages = pkgmap;
  exports.pkg      = pkg;
  exports.require  = function require(uri){ return pkgmap.main.index.require(uri); };

  {{#debug}}
  exports.debug    = true;
  {{/debug}}

  {{#ties}}
  ties             = {{{ ties }}};
  {{/ties}}

  {{#aliases}}
  aliases          = {{{ aliases }}};
  {{/aliases}}

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
