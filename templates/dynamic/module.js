{{^debug}}'{{ id }}': function(module, exports, global, require, undefined){
  {{{content}}}
}, {{/debug}}
{{#debug}}'{{ id }}': Function('module', 'exports', 'global', 'require', 'undefined', {{{contentWithSourceURLs}}}),{{/debug}}
