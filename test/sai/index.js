var monouchi = require('monouchi'),
    core     = require('./core'),
    foo      = require('./foo'),
    bar      = require('./bar'),
    manifest = require('./package');

try {
  require('one');
} catch(err) {}

exports.sai = monouchi.monouchi && foo.foo && bar.bar && core.core && manifest.name == 'sai';
