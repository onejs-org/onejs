/*global require:false, module:false */
var {{ name }} = (function(){

  var pkgmap        = {},
      global        = {},
      nativeRequire = typeof require != 'undefined' && require,
      lib, ties, main;

  function exports(){ return main(); };

  exports.require  = function require(uri){ return pkgmap.main.index.require(uri); };
  exports.module   = module;
  exports.packages = pkgmap;
  exports.pkg      = pkg;

  {{#debug}}
  exports.debug    = true;
  {{/debug}}

  {{#ties}}
  ties             = {{{ ties }}};
  {{/ties}}

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
