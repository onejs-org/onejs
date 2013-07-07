var newModule     = require("../lib/module"),
    newPackage    = require('../lib/package'),
    newDependency = require('../lib/dependency'),
    packageOf     = require('../lib/package-of'),
    fs            = require('fs');

describe('newModule', function(){

  var m;

  beforeEach(function(){
    m = newModule('test/sai/index.js');
  });

  it('creates a module object from given filename', function(){
    expect(m.name).to.equal('index');
    expect(m.filename).to.equal('test/sai/index.js');
    expect(m.content).to.match(/sai = /);
  });

  it('returns same module object for same filenames', function(){
    var a = newModule('test/sai/index.js'),
        b = newModule('test/sai/foo.js');

    expect(a).to.equal(m);
    expect(a).to.not.equal(b);
  });

  it('contains the list of require calls', function(){
    expect(m.requires).to.deep.equal(['monouchi', './core', './foo', './bar', './package']);
  });

  it('contains all relative modules in same package', function(){
    expect(m.relatives.length).to.equal(9);
    expect(m.relatives.toString()).to.equal('core, foo, bar, package, cor, ge, eggs, span, index');
    expect(m.relatives[4].relatives.toString()).to.equal('ge, eggs, span');
  });

  it('contains its  dependencies', function(){
    expect(m.dependencies.length).to.equal(1);
    expect(m.dependencies[0].name).to.equal('monouchi');
    expect(m.dependencies[0].main.relatives[0].dependencies.length).to.equal(1);
    expect(m.dependencies[0].main.relatives[0].dependencies[0].name).to.equal('tsume');
  });

  it('contains a map of its require calls with corressponding modules', function(){
    expect(Object.keys(m.map)).to.deep.equal(['./core', './foo', './bar', './package', 'monouchi']);
    expect(m.map.monouchi).to.equal(m.dependencies[0].id);

    m = newModule('test/sai/node_modules/yoku/index.js');
    expect(Object.keys(m.map)).to.deep.equal(['./lib', './lib/yo', './lib/ku', 'monouchi', 'moto']);
  });

  it('gets the counter value as id', function(){
    expect(m.id).to.equal(0);
    expect(m.relatives[0].id).to.equal(1);
  });

  it('returns nil for wrong filenames', function(){
    expect(newModule('unexisting')).to.not.exists;
  });

  it('should not bundle not required modules', function(){
    m.relatives.forEach(function(el){
      expect(el.filename).to.not.match(/not-required/);
    });
  });

});

describe('newPackage', function(){

  var p;

  beforeEach(function(){
    p = newPackage('quux', 'test/sai/lib/quux/eggs.js');
  });

  it('creates a package object for any entry point', function(){
    expect(p.name).to.equal('quux');
    expect(p.main.filename).to.equal('test/sai/lib/quux/eggs.js');
    expect(p.main.map['../span']).to.equal(p.main.relatives[0].id);
    expect(Object.keys(p.main.map).length).to.equal(1);
    expect(p.main.relatives.length).to.equal(1);
    expect(p.main.relatives[0].name).to.equal('span');
    expect(p.main.relatives[0].dependencies[0].main.filename).to.match(/monouchi\/index\.js/);
    expect(p.main.relatives[0].dependencies[1].main.filename).to.match(/yoku\/index\.js/);
  });

  it('returns same package object for same names disregarding the filename', function(){
    var copy = newPackage('quux', 'test/sai/index.js');
    expect(copy).to.equal(p);
  });

});

describe('packageOf', function(){

  it('returns the package given module belongs to', function(){
    var m = newModule('test/sai/index.js'),
        p = packageOf(m);

    expect(p.name).to.equal('sai');
    expect(p.component).to.not.exist;
    expect(m.relatives[2].pack).to.equal(m.pack);
    expect(m.relatives[4].pack).to.equal(m.pack);

    m = newModule('test/node-component/index.js');
    p = packageOf(m);

    expect(p.name).to.equal('node-component');
    expect(p.component.name).to.equal('node-component');
    expect(m.relatives[0].pack).to.equal(m.pack);

  });

});


describe('newDependency', function(){

  var p, m;

  beforeEach(function(){
    p = newDependency('test/sai/package.json');
    m = newModule('test/sai/index.js');
  });

  it('creates a new package from a package path', function(){
    expect(p.name).to.equal('sai');
    expect(p.main.filename).to.equal('test/sai/index.js');
  });

  it('returns same package object for any path to same package', function(){
    var copy = newDependency('test/sai/lib/quux/eggs.js');

    expect(copy).to.equal(p);
    expect(copy.name).to.equal('sai');
    expect(copy.main.filename).to.equal('test/sai/index.js');
  });

  it('contains the main module', function(){
    expect(p.main).to.equal(m);
  });

});

describe('render', function(){

  var m = newModule('test/sai/index.js').render();

  it('returns the rendered output of a module', function(){
    expect(eval(m).sai).to.be.true;
  });

});

describe('recursive requires', function(){

  it('bundles modules calling eachother', function(){
    var m = newModule('test/recursive/modules/b.js').render();
    expect(eval(m)).to.deep.equal({ b: { a : true } });
  });

  it('bundles dependencies calling eachother', function(){
    var m = newModule('test/recursive/packages/index.js').render();
    expect(eval(m)).to.deep.equal({ index: { foo: { bar: true } }  });;
  });

  it('bundles core modules with recursive require calls', function(){

    var m = newModule('test/recursive/core/a.js').render();

    //console.log(eval(m));

  });

});
