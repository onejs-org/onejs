var global;

if (module.exports !== void 0) {
  global = module.exports;
} else {
  global = window;
};

global.require = function(u){

  var key;
  for (key in require.m){
    if ( require.m[key][1][u] != undefined && require.m[ require.m[key][1][u] ] ){
      return require(require.m[ require.m[key][1][u] ]);
    }
  }

  {if-not-found}
};
