var monouchi = require('monouchi'),
    foo = require('./foo'),
    bar = require('./bar');

console.log('this is sai', foo, bar, monouchi);

exports.sai = monouchi.monouchi && foo.foo && bar.bar;
