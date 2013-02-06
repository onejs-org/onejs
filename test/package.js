var assert            = require('assert'),
    compose           = require('functools').compose,
    one               = require('../lib/'),
    utils             = require('./common'),
    assertListContent = utils.assertListContent,
    moduleFilenames   = utils.moduleFilenames;

function beforeEach(callback){
  one.pkg.id = one.id();
  callback();
}

function testConstruct(callback){

  var ctx1 = {
    'id': 5,
    'manifest': {
      'name': 'foobar',
      'directories': undefined
    },
    'wd': 'foobar'
  };

  var ctx2 = {
    'id': undefined,
    'manifest': {
      'name': 'qux',
      'directories': {
        'lib': './lib'
      }
    },
    'wd': 'qux'
  };

  var ctx3 = {
    'id': undefined,
    'manifest': {
      'name': 'quux',
      'directories': {
        'lib': './lib'
      }
    },
    'wd': 'quux'
  };

  var ctx4 = {
    'id': undefined,
    'manifest': {
      'name': 'corge',
      'directories': {
        'lib': './lib'
      }
    },
    'wd': 'corge'
  };

  one.pkg.construct(ctx1, function(error, pkg1){
    assert.ok(!error);
    //assert.equal(pkg1.id, 5);
    assert.equal(pkg1.name, 'foobar');
    assert.equal(pkg1.parents.length, 0);
    assert.ok(pkg1.pkgdict);
    assert.ok(pkg1.dirs);

    ctx2.parent = pkg1;

    one.pkg.construct(ctx2, function(error, pkg2){
      assert.ok(!error);
      //assert.equal(pkg2.id, 1);
      assert.equal(pkg2.name, 'qux');

      assert.equal(pkg2.parents.length, 1);
      assert.equal(pkg2.parents[0], pkg1);

      assert.equal(pkg2.pkgdict, pkg1.pkgdict);
      assert.equal(pkg2.dirs.lib, './lib');

      ctx3.parents = [pkg2];

      one.pkg.construct(ctx3, function(error, pkg3){
        assert.ok(!error);

        assert.equal(pkg3.name, 'quux');
        assert.equal(pkg3.pkgdict, pkg1.pkgdict);
        assert.equal(pkg3.parents.length, 1);

        assert.equal(pkg3.parents[0], pkg2);

        ctx4.parents = [pkg2, pkg3];

        one.pkg.construct(ctx4, function(error, pkg4){
          assert.ok(!error);

          assert.equal(pkg4.name, 'corge');
          assert.equal(pkg4.pkgdict, pkg1.pkgdict);
          assert.equal(pkg4.parents.length, 2);
          assert.equal(pkg4.parents[0], pkg2);
          assert.equal(pkg4.parents[1], pkg3);

          callback();

        });

      });

    });

  });
}

function testContent(callback){
  one.manifest('test/packages/example-project/package.json', function(error, manifest){

    if(error){
      callback(error);
      return;
    }

    one.pkg.construct({ 'manifest': manifest, 'ignore':['lib/ignored1.js', 'lib/ignored2', 'lib/ignored3'], 'wd':'test/packages/example-project/' }, function(error, pkg){

      if(error){
        callback(error);
        return;
      }

      one.pkg.content(pkg, { 'exclude': ['exclude'] }, function(error, pkg){

        if(error){
          callback(error);
          return;
        }

        var pkgdict, filenames;

        try {
          //assert.equal(pkg.id, 1);
          assert.equal(pkg.name, 'example-project');
          assert.equal(pkg.manifest.name, 'example-project');
          assert.equal(pkg.dependencies.length, 2);
          assert.equal(pkg.main.filename, 'a.js');

          pkgdict = Object.keys(pkg.pkgdict);

          assert.equal(pkgdict.length, 7);

          assert.equal(pkgdict[0], 'example-project');
          assert.equal(pkgdict[1], 'dependency');
          assert.equal(pkgdict[2], 'subdependency');
          assert.equal(pkgdict[3], 'fruits');
          assert.equal(pkgdict[4], 'sibling');
          assert.equal(pkgdict[5], 'vegetables');
          assert.equal(pkgdict[6], 'vehicles');

          assert.ok(assertListContent( moduleFilenames(pkg.modules), ['web.js', 'a.js', 'b.js']));

          assert.ok(assertListContent( moduleFilenames(pkg.pkgdict.dependency.modules), ['f.js','g.js']));

          assert.ok(assertListContent( moduleFilenames(pkg.pkgdict.subdependency.modules ), ['i.js']));

          assert.ok(assertListContent( moduleFilenames(pkg.pkgdict.fruits.modules ), ['index.js', 'lib/fruits.js']));

          assert.ok(assertListContent( moduleFilenames(pkg.pkgdict.vegetables.modules ), ['lib/index.js']));

          assert.ok(assertListContent( moduleFilenames(pkg.pkgdict.vehicles.modules ), ['index.js', 'lib/vehicles.js']));

          assert.ok(assertListContent( moduleFilenames(pkg.pkgdict.sibling.modules), ['p/index.js', 'p/r.js', 's/t.js', 'n.js']));

          callback();
        } catch(err){
          callback(err);
        }

      });

    });

  });

}

function testMain(callback){
  one.pkg('test/packages/example-project/package.json', { 'exclude':['exclude'] }, function(error, ep){
    //    assert.equal(ep.id, 1);
    assert.equal(ep.name, 'example-project');
    assert.equal(ep.manifest.name, 'example-project');
    assert.equal(ep.dependencies.length, 2);
    assert.equal(ep.main.filename, 'a.js');
    callback();
  });
}

module.exports = {
  'beforeEach': beforeEach,
  'testConstruct': testConstruct,
  'testContent': testContent,
  'testMain': testMain
};
