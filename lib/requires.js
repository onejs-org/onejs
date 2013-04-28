var debug = require("./debug")('requires');

module.exports = requires;

function isNotOne(uri){
  return uri != 'one';
}

function requires(module){
  var re = /require\((?:'|")([^\'\"]+)(?:'|")\)/g,
      matching,
      result = [];

  while( ( matching = re.exec(module.content) ) ){
    result.push(matching[1]);
  }

  if(result.length){
    debug('%s requires: %s', module.name, result.join(', '));
  }

  return result.filter(isNotOne);
}
