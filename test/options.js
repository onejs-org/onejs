var one     = require("../"),
    options = require('../lib/options'),
    only    = it;

describe('global', function(){

  beforeEach(function(){
    options.global(false);
    require('../lib/render').renderModule.reset();
  });

  it('exposes a global require', function(){
    var ctx = {};
    eval(wrap(one('test/sai/index.js').global().render()));

    expect(ctx.require('./foo').foo).to.be.true;
    expect(ctx.require('moto').moto).to.be.true;

  });

  only('exposes if enabled', function(){
    var ctx = {};
    eval(wrap(one('test/recursive/modules/a.js').global().render()));
    expect(ctx.require).to.not.exit;
  });

});

describe('require', function(){

  beforeEach(function(){
    require('../lib/render').renderModule.reset();
  });

  it('adds a new require call relative to the main module, into the bundle', function(){
    var ctx = {};
    eval(wrap(one('test/sai/index.js').require('./lib/not-required').global().render()));
    ctx.require('./lib/not-required');
  });

});

describe('ignore', function(){

  beforeEach(function(){
    require('../lib/render').renderModule.reset();
  });

  it('ignores packages', function(){
    var ctx = {};
    try {
      eval(wrap(one('test/sai/index.js').ignore('yoku').global().render()));
    } catch (err) {
    }

    ctx.require('monouchi');
    ctx.require('tsume');

    function yoku(){
      ctx.require('yoku');
    }

    expect(yoku).to.throw(Error);
  });

  it('ignores modules', function(){
    var ctx = {};
    try {
      eval(wrap(one('test/sai/index.js').ignore('test/sai/bar.js').global().render()));
    } catch (err) {
    }

    function bar(){
      ctx.require('./bar');
    }

    expect(bar).to.throw(Error);
  });


});



function wrap(code){
  return '(function(){ ' + code + '}).call(ctx);';
}
