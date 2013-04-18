var fs   = require("fs"),
    puts = require('util').puts;

module.exports = function(){
  var man = fs.readFileSync(__dirname + '/../docs/man');
  process.stdout.write('\u001B[2J\u001B[0;0f');
  puts(man);
  process.exit(0);
};
