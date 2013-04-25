var monouchi = require('monouchi'),
    core     = require('./core'),
    foo      = require('./foo'),
    bar      = require('./bar'),
    manifest = require('./package');

exports.sai = monouchi.monouchi && foo.foo && bar.bar && core.core && manifest.name == 'sai';
