var newModule = require('./module');

module.exports = cli;

function cli(options){
  var entry  = options._[0],
      bundle = newModule(entry);

  console.log(bundle.render());
}
