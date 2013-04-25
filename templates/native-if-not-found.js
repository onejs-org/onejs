if(require.nt) {
  return require.nt(u);
} else {
  throw new Error('Cannot find module "' + u + '"');
}
