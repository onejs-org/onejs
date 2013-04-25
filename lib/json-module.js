var debug  = require('./debug')('json-module'),
    fs = require('fs');

module.exports = newJSONModule;

function contentOf(filename){
  return fs.readFileSync(filename).toString();
}

function newJSONModule(id, name, filename){
  debug('New JSON module: %d, %s, %s', id, name, filename);

  return {
    id           : id,
    content      : contentOf(filename),
    filename     : filename,
    name         : name,
    isModule     : true,
    isJSON       : true,
    requires     : [],
    dependencies : [],
    map          : {},
    relatives    : []
  };
}
