function require(o){
  if(o[2]) return o[2].exports;

  o[0](function(u){
    if(!require.m[o[1][u]]) throw new Error('Cannot find module "' + u + '"');
    return require(require.m[o[1][u]]);
  }, o[2] = { exports: {} }, o[2].exports);

  return o[2].exports;
};
