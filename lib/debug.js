var debug  = require("debug"),
    prefix = 'one';

module.exports = function(name){
  return debug(prefix + ':' + name);
};
