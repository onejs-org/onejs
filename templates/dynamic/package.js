{{ treeName }}.pkg({{#hasParent}}{{{ parentIds }}}, {{/hasParent}}function(parents){

  return {
    'name'         : '{{ name }}',
    'main'         : undefined,
    'mainModuleId' : '{{ main }}',
    'modules'      : [],
    'parents'      : parents
  };

})({ {{{modules}}} });
