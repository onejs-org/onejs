var monouchi = require('monouchi'),
    core     = require('./core'),
    foo      = require('./foo'),
    bar      = require('./bar');

exports.sai = monouchi.monouchi && foo.foo && bar.bar && core.core;
