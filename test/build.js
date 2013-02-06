var assert            = require('assert'),
    one               = require('../lib'),

    common            = require('./common'),
    assertListContent = common.assertListContent;

module.exports = {
  'init': init,
  'test_packageTree': test_packageTree,
  'test_moduleTree': test_moduleTree,
  'test_packageCtx': test_packageCtx,
  'test_moduleCtx': test_moduleCtx,
  'test_require': test_require,
  'test_module_caching': test_module_caching,
  'test_useNativeRequire': test_useNativeRequire,
  'test_parent': test_parent,
  'test_tie': test_tie,
  'testMustacheSyntax': testMustacheSyntax
};


function moduleIds(modules){
  return modules.map(function(m){
    return m.id;
  });
}

function init(options, callback){
  if(options.target){
    callback(undefined, require(options.target));
    return;
  }

  common.build('tmp/built.js', ['--tie json=JSON,pi=Math.PI', '--exclude exclude'], function(exitCode){
    callback(undefined, require('../tmp/built'));
  });
}

function test_useNativeRequire(mod, callback){
  assert.ok( mod.require('combiner').flatten );
  callback();
}

function test_moduleTree(mod, callback){
  assert.ok( assertListContent(moduleIds(mod.packages.main.modules), ['a', 'b', 'web'] ) );
  assert.ok( assertListContent(moduleIds(mod.packages.subdependency.modules), ['i'] ) );
  callback();
}

function test_moduleCtx(mod, callback){
  var pkg = mod.packages.main,
      a, b, web;

  assert.equal(pkg.modules.length, 3);

  var i = pkg.modules.length;
  while(i-->0){
    switch(pkg.modules[i].id){
      case 'a':
        a = pkg.modules[i];
        break;
      case 'b':
        b = pkg.modules[i];
        break;
      case 'web':
        web = pkg.modules[i];
        break;
    }
  }

  assert.equal(a.id, 'a');
  assert.equal(a.pkg.name, 'example-project');
  assert.equal(typeof a.wrapper, 'function');
  assert.ok(a.require);

  var n = mod.packages.sibling.index;

  assert.equal(n.id, 'n');
  assert.equal(n.pkg.name, 'sibling');
  assert.equal(typeof n.wrapper, 'function');

  var g = mod.packages.dependency.modules[ mod.packages.dependency.modules[0].id == 'g' ? 0 : 1 ];

  assert.equal(g.id, 'g');
  assert.equal(g.pkg.name, 'dependency');
  assert.equal(typeof g.wrapper, 'function');

  assertListContent(mod.packages.fruits.index.call(), ['apple', 'orange']);
  assertListContent(mod.packages.vegetables.index.call(), ['tomato', 'potato']);
  assertListContent(mod.packages.vehicles.index.call(), ['car', 'boat', 'truck']);

  callback();
}

function test_packageCtx(mod, callback){
  assert.ok(mod.require);

  var p = mod.packages.main;
  assert.equal(p.name, 'example-project');
  assert.equal(p.parents.length, 0);
  assert.equal(p.mainModuleId, 'a');
  assert.equal(p.index.id, 'a');

  assert.ok( assertListContent(moduleIds(p.modules), ['a', 'b', 'web']) );

  callback();
}

function test_packageTree(mod, callback){

  var main          = mod.packages.main,
      dependency    = mod.packages.dependency,
      sibling       = mod.packages.sibling,
      subdependency = mod.packages.subdependency,
      fruits        = mod.packages.fruits;

  assert.equal( fruits.parents.length, 1 );
  assert.equal( fruits.parents[0], dependency.name );

  assert.equal( subdependency.parents.length, 1 );
  assert.equal( subdependency.parents[0], dependency.name );

  assert.equal( sibling.parents.length, 2 );
  assert.equal( sibling.parents[0], dependency.name );
  assert.equal( sibling.parents[1], main.name );

  assert.equal( dependency.parents.length, 1 );
  assert.equal( dependency.parents[0], main.name );

  assert.equal( main.parents.length, 0 );

  callback();
}

function test_require(mod, callback){
  assert.ok(mod.require('./b').b);
  assert.ok(mod.require('dependency').f);

  callback();
}

function test_module_caching(mod, callback){
  var now = mod().now;
  assert.ok(now > +(new Date)-1000);

  setTimeout(function(){
    assert.equal(mod().now, now);
    callback();
  }, 50);
}

function test_parent(mod, callback){
  var a = mod(),
      f = a.dependency;

  assert.equal(a.parent, undefined);
  assert.equal(f.parent.id, 'a');

  callback();
}

function test_tie(mod, callback){
  assert.equal(mod.require('pi'), Math.PI);
  assert.equal(mod.require('json'), JSON);
  callback();
}

function testMustacheSyntax(mod, callback){
  assert.equal( mod.require('./a').mustacheSyntax, '{{ foobar }}');
  callback();
}

