var monouchi = require('monouchi'),
    foo      = require('./foo'),
    bar      = require('./bar');

exports.sai = monouchi.monouchi && foo.foo && bar.bar;
