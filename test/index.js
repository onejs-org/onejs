var newModule  = require("../lib/module"),
    newPackage = require('../lib/package'),
    fs         = require('fs');

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
    expect(m.requires).to.deep.equal(['monouchi', './foo', './bar']);
  });

  it('contains all relative modules in same package', function(){
    expect(m.relatives.length).to.equal(6);
    expect(m.relatives.toString()).to.equal('foo, bar, cor, ge, eggs, span');
    expect(m.relatives[2].relatives.toString()).to.equal('ge, eggs, span');
  });

  it('contains all the dependencies', function(){
    expect(m.dependencies.toString()).to.deep.equal('monouchi, yoku, moto, tsuka, tsume');
    expect(m.dependencies[0].dependencies).to.equal(m.dependencies[0].main.dependencies);
  });

  it('contains a map of its require calls with corressponding modules', function(){
    expect(Object.keys(m.map)).to.deep.equal(['./foo', './bar', 'monouchi']);
    expect(m.map.monouchi).to.equal(m.dependencies[0].main);

    m = newModule('test/sai/node_modules/yoku/index.js');
    expect(Object.keys(m.map)).to.deep.equal(['./lib/yo', './lib/ku', 'monouchi', 'moto']);
  });

  it('gets the counter value as id', function(){
    expect(m.id).to.equal(0);
    expect(m.relatives[0].id).to.equal(1);
  });

  it('returns nil for wrong filenames', function(){
    expect(newModule('unexisting')).to.not.exists;
  });

});

describe('newPackage', function(){

  var p, m;

  beforeEach(function(){
    p = newPackage('test/sai/package.json');
    m = newModule('test/sai/index.js');
  });

  it('creates a new package from a manifest filename', function(){

    expect(p.name).to.equal('sai');
    expect(p.manifest.name).to.equal('sai');
    expect(p.manifest.main).to.equal('index.js');

  });

  it('creates a new package from a module filename', function(){
    var copy = newPackage('test/sai/lib/quux/eggs.js');

    expect(copy).to.equal(p);
    expect(copy.name).to.equal('sai');
    expect(copy.version).to.equal('0.0.0');
    expect(copy.manifest.name).to.equal('sai');
    expect(copy.manifest.main).to.equal('index.js');
  });

  it('contains the main module', function(){
    expect(p.main).to.equal(m);
  });

});

describe('render', function(){

  var m;

  beforeEach(function(){
    m = newModule('test/sai/index.js');
  });

  it('returns the rendered output of a module', function(){
    fs.writeFileSync('test/sai-bundle.js', 'module.exports = ' + m.render().slice(1));
    expect(require('./sai-bundle').sai).to.be.true;
  });
});
