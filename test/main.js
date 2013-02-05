var child_process     = require('child_process'),

    one               = require('../lib'),
    templating        = one.templating,

    assert            = require('assert'),
    fs                = require('fs'),
    kick              = require('highkick'),

    common            = require('./common'),
    moduleFilenames   = common.moduleFilenames,
    assertListContent = common.assertListContent;

one.quiet(true);

var test_build     = kick('./build'),
    test_package   = kick('./package'),
    test_manifest  = kick('./manifest'),
    test_npmignore = kick('./npmignore');

module.exports = {
  'init': clean,
  'test_package': test_package,
  'test_manifest': test_manifest,
  'test_dependencies':test_dependencies,
  'test_dependencies_in_parent_dir': test_dependencies_in_parent_dir,
  'test_modules':test_modules,
  'test_filterFilename':test_filterFilename,
  'test_flattenPkgTree':test_flattenPkgTree,
  'test_id':test_id,
  'test_loadModule':test_loadModule,
  'test_objectName':test_objectName,
  'test_moduleName':test_moduleName,
  'test_assertListContent':test_assertListContent,
  'test_targets': test_targets,

  'test_build':test_build,
  'test_build_debug':test_build_debug,
  'test_build_plain': test_build_plain,

  'test_npmignore': test_npmignore
//  'test_programmatic_api': test_programmatic_api
};

function clean(){
  var callback = arguments[ arguments.length - 1 ],
      rm = child_process.exec('rm -rf tmp/* & mkdir tmp');

  rm.on('exit', function(){
    callback && callback();
  });
}

function test_assertListContent(callback){
  assert.ok(assertListContent([3,1,4],[4,3,1]));
  assert.ok(!assertListContent([3,[1],4],[4,3,[1]]));
  assert.ok(!assertListContent([3,1,4],[3,1,6]));
  assert.ok(!assertListContent([3,1,4],[3,1,4,6]));
  callback();
}

function test_build_debug(callback){
  common.build('tmp/built_debug.js', ['--debug'], function(exitCode){
    var ep  = require('../tmp/built_debug'),
        now = ep.main().now;

    assert.equal( ep.debug, true);

    setTimeout(function(){
      assert.ok( ep.main().now > now );
      callback();
    }, 10);
  });
}

function test_build_plain(callback){

  common.build('test/packages/example-project/node_modules/dependency/node_modules/vegetables', 'tmp/built_plain.js', ['--plain'], function(exitCode){

    fs.readFile('tmp/built_plain.js', function(error, bf){

      if(error){
        callback(error);
        return;
      }

      assert.ok( ! bf.toString().match(/pkgdefs/) );

      var vegetables = require('../tmp/built_plain');

      assertListContent(vegetables, ['tomato', 'potato']);

      callback();

    });

  });

}

function test_dependencies(callback){
  one.manifest('test/packages/example-project/package.json', function(error, manifest){

    if(error){
      callback(error);
      return;
    }

    one.pkg.construct({ 'manifest': manifest, 'wd': 'test/packages/example-project/' }, function(error, pkg1){


      one.dependencies(pkg1, { 'exclude':['exclude'] }, function(error, deps){
        if(error){
          callback(error);
          return;
        }

        assert.equal(deps.length, 2);
        assert.ok(assertListContent( deps.map(function(el){ return el.name; }), ['dependency', 'sibling']));

        var dependency = deps.filter(function(el){ return el.name == 'dependency' })[0];
        assert.equal(dependency.dependencies[0].name, 'subdependency');

        assert.equal(dependency.dependencies[0].parents[0], deps[0]);

        callback();

      });

    });

  });
}

function test_dependencies_in_parent_dir(callback){
  var pkg = {
    'name':'dependency',
    'manifest':{
      'dependencies':{
        'subdependency':'*',
        'sibling':'*'
      }
    },
    'wd':'test/packages/example-project/node_modules/dependency',
    'pkgdict':{}
  };

  one.dependencies(pkg, {}, function(error, deps){
    if(error){
      callback(error);
      return;
    }

    try {
      assert.equal(deps.length, 2);
      assert.ok(assertListContent( deps.map(function(el){ return el.name; }), ['subdependency', 'sibling']));

      callback();
    } catch(exc) {
      callback(exc);
    }

  });
}

function test_id(callback){
  var i = one.id();

  assert.equal(typeof i, 'function');

  assert.equal(i(), 1);
  assert.equal(i(), 2);

  callback();
}


function test_modules(callback){
  one.modules({ 'name':'example-project', 'ignore':['lib/ignore'], 'dirs':{'lib':'lib'}, 'wd':'test/packages/example-project/' }, {}, function(error, modules){

    if(error){
      callback(error);
      return;
    }

    assert.ok(assertListContent(moduleFilenames(modules), ['a.js', 'b.js','web.js']));

    one.modules({ 'name': 'subdependency', 'manifest':{ 'main':'i' }, 'wd':'test/packages/example-project/node_modules/dependency/node_modules/subdependency/' }, {}, function(error, modules){

      if(error){
        callback(error);
        return;
      }

      assert.ok(assertListContent(moduleFilenames(modules), ['i.js']));
      callback();
    });

  });

}


function test_filterFilename(callback){

  var legalPaths = ['foo.js','lib/bar/qux.js','lib/qux/quux.js','node_modules/foo/lib/bar.js'],
      illegalPaths = ['lib/foo','lib/qux.j'];

  for(var i = -1, len=legalPaths.length; ++i < len; ){
    assert.ok(one.modules.filterFilename(legalPaths[i]));
  };

  for(var i = -1, len=illegalPaths.length; ++i < len; ){
    assert.ok(!one.modules.filterFilename(illegalPaths[i]));
  };

  callback();
}

function test_loadModule(callback){
  one.modules.loadModule('test/packages/example-project/lib/a.js', function(error, module){
    try {
      assert.equal(module.name, 'a');
      assert.equal(module.filename, 'test/packages/example-project/lib/a.js');
      assert.equal(module.content.substring(0,12), 'var mustache');
      callback();
    } catch(err){
      callback(err);
    }
  });
}

function test_moduleName(callback){
  assert.equal(one.modules.fixname('foo.js'),'foo');
  assert.equal(one.modules.fixname('foo/bar/qux.js'),'qux');
  assert.equal(one.modules.fixname('foo'));
  assert.equal(one.modules.fixname('foo/bar/qux'));
  assert.equal(one.modules.fixname('foo.js/bar.js/qux'));
  assert.equal(one.modules.fixname('foo.js/bar.js/qux.js.'));
  assert.equal(one.modules.fixname('qux/quux/c-orge.js'),'c-orge');
  callback();
}

function test_renderPackage(callback){
  throw new Error('not implemented');
}

function test_objectName(callback){
  assert.equal(templating.objectName('fooBar'), 'foobar');
  assert.equal(templating.objectName('foo bar'), 'fooBar');
  assert.equal(templating.objectName('foo BAR'), 'fooBar');
  assert.equal(templating.objectName('foo$bar-qux'), 'fooBarQux');
  assert.equal(templating.objectName('foo bar-=-qux'), 'fooBarQux');
  assert.equal(templating.objectName('foo_bar'), 'fooBar');
  assert.equal(templating.objectName('3.14foo15Bar9'), 'foo15bar9');
  callback();
}

function test_flattenPkgTree(callback){
  var ids = [1,2,3,4,5,6,9,7,8],
      map = {
        pkgdict: {
          'corge': 0,
          'foo': 1,
          'bar': 2,
          'quux': 3
        }
      };

  var flat = templating.flattenPkgTree(map);
  assert.equal(flat.length, 4);

  var i = 4;
  while( i -- ){
    assert.equal(flat[i], i);
  }

  callback();
}

function test_targets(done){
  var pkg1 = { manifest: { name: 'one' } },
      pkg2 = { manifest: { name: 'one', web: { save: 'foo' } } },
      pkg3 = { manifest: { name: 'one', web: { save: { one: 'foo' } } } },
      pkg4 = { manifest: { name: 'one', web: { save: { one: { to: 'foo' }, two: { to: 'bar', 'url': 'qux' } } } } };

  assert.deepEqual(one.targets(pkg1, {}, {}), {});
  assert.deepEqual(one.targets(pkg1, {}, { target: 'foo' }), { one: { to: 'foo' } });
  assert.deepEqual(one.targets(pkg2, {}, {}), { one: { to: 'foo' } });
  assert.deepEqual(one.targets(pkg3, {}, {}), { one: { to: 'foo' } });
  assert.deepEqual(one.targets(pkg4, {}, {}), { one: { to: 'foo' }, two: { to: 'bar', url: 'qux' } });

  done();
}
