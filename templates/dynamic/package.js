{{ treeName }}.pkg({{#hasParent}}{{{ parentIds }}}, {{/hasParent}}function(parents){

  return {
    'name'         : '{{ name }}',
    'mainModuleId' : '{{ main }}',
    'modules'      : [],
    'parents'      : parents
  };

})({ {{{modules}}} });
