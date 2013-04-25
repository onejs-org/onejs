var debug  = require('./debug')('is-json'),
    exists = require('fs').existsSync;

module.exports = isJSON;

function isJSON(filename){
  var is = filename.slice(-5) == '.json' || exists(filename + '.json');

  debug('Is %s JSON: %s', filename, is);

  return is;
}
