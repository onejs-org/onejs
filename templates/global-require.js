window.require = function(u){
  var key;
  for (key in require.m){
    if ( require.m[key][1][u] && require.m[ require.m[key][1][u] ] ){
      return require(require.m[ require.m[key][1][u] ]);
    }
  }

  {if-not-found}
};
