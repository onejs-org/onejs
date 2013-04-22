module.exports = (function(){

require.m = { 0 : [function(require, module, exports){ var monouchi = require('monouchi'),
    foo = require('./foo'),
    bar = require('./bar');

console.log('this is sai', foo, bar, monouchi);

exports.sai = monouchi.monouchi && foo.foo && bar.bar;
 }, {"./foo":1,"./bar":11,"monouchi":5}]
,1 : [function(require, module, exports){ exports.foo = true;
require("yoku");
 }, {"yoku":2}]
,11 : [function(require, module, exports){ exports.bar = true;

require('./lib/cor');
 }, {"./lib/cor":12}]
,12 : [function(require, module, exports){ exports.cor = true;

require('./ge');
 }, {"./ge":13}]
,13 : [function(require, module, exports){ exports.ge = true;

require('./quux/eggs');
 }, {"./quux/eggs":14}]
,14 : [function(require, module, exports){ exports.eggs = true;

require('../span');
 }, {"../span":15}]
,15 : [function(require, module, exports){ exports.span = true;

require('monouchi');
require('yoku');
 }, {"monouchi":5,"yoku":2}]
,5 : [function(require, module, exports){ var qux = require('./qux'),
    corge = require('./corge');

exports.monouchi = true;
 }, {"./qux":6,"./corge":7}]
,6 : [function(require, module, exports){ exports.qux = true;

require('./corge');
require('tsume');
 }, {"./corge":7,"tsume":8}]
,7 : [function(require, module, exports){ exports.corge = true;
 }, {}]
,2 : [function(require, module, exports){ exports.yoku = true;

require('monouchi');
require('./lib/yo');
require('./lib/ku');
require('moto');
require('unexisting');
 }, {"./lib/yo":3,"./lib/ku":4,"monouchi":5,"moto":9}]
,3 : [function(require, module, exports){ exports.yo = true;

require('./ku');
 }, {"./ku":4}]
,4 : [function(require, module, exports){ exports.ku = true;
 }, {}]
,9 : [function(require, module, exports){ exports.moto = true;

require('tsuka');
require('monouchi');
 }, {"tsuka":10,"monouchi":5}]
,10 : [function(require, module, exports){ require('monouchi');
 }, {"monouchi":5}]
,8 : [function(require, module, exports){ exports.tsume = true;
 }, {}]
 };

return require(require.m[0]);

function require(o){
  if(o[2]) return o[2].exports;

  o[0](function(u){
    console.log('#', u, o[1][u]);
    if(!require.m[o[1][u]]) throw new Error('Cannot find module "'+u+'"');
    return require(require.m[o[1][u]]);
  }, o[2] = { exports: {} }, o[2].exports);

  return o[2].exports;
};


}());
