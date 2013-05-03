var one     = require("../"),
    options = require('../lib/options'),
    only    = it;

describe('global', function(){

  beforeEach(function(){
    options.global(false);
    options.native(false);
    require('../lib/render').renderModule.reset();
    require('../lib/package').reset();
    require('../lib/module').reset();
  });

  it('exposes a global require', function(){
    var window = {};

    eval(wrap(one('test/sai/package.json').global().render()));

    expect(window.require('sai').sai).to.be.true;
    expect(window.require('./foo').foo).to.be.true;
    expect(window.require('moto').moto).to.be.true;
  });

  it('allows changing the global path', function(){

  });

  only('exposes if enabled', function(){
    var window = {};
    eval(wrap(one('test/recursive/modules/a.js').global().render()));
    expect(window.require).to.not.exit;
  });

});

describe('require', function(){

  beforeEach(function(){
    require('../lib/render').renderModule.reset();
    require('../lib/options').native(false);
  });

  it('adds a new require call relative to the main module, into the bundle', function(){
    var window = {};
    eval(wrap(one('test/sai/index.js').require('./lib/not-required').require('not-required').global().render()));
    expect(window.require('not-required').notrequired).to.be.true;
    window.require('./lib/not-required');
  });

});

describe('ignore', function(){

  beforeEach(function(){
    require('../lib/render').renderModule.reset();
  });

  it('ignores packages', function(){
    var window = {};
    try {
      eval(wrap(one('test/sai/index.js').ignore('yoku').global().render()));
    } catch (err) {
    }

    window.require('monouchi');
    window.require('tsume');

    function yoku(){
      window.require('yoku');
    }

    expect(yoku).to.throw(Error);
  });

  it('ignores modules', function(){
    var window = {};
    try {
      eval(wrap(one('test/sai/index.js').ignore('test/sai/bar.js').global().render()));
    } catch (err) {
    }

    function bar(){
      window.require('./bar');
    }

    expect(bar).to.throw(Error);
  });


});

describe('native', function(){

  beforeEach(function(){
    require('../lib/render').renderModule.reset();
    options.native(false);
  });

  it('forwards builtins & unresolved modules to native require', function(){
    var window = { require: require };
    eval(wrap(one('test/native/index.js').native().render()));
    expect(window.native).to.be.equal(require('child_process'));
  });

  /*only('if native enabled', function(){
    var window = { require: require };
    eval(wrap(one('test/native/index.js').render()));
    expect(window.native.spawn()).to.not.exist;
  });*/

});

function wrap(code){
  return '(function(){ ' + code + '}).call(window);';
}
