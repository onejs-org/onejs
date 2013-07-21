var componentAt = require('../lib/component-at'),
    newModule   = require('../lib/module');

describe('component-at', function(){

  it('finds the component at given path', function(){
    var component = componentAt('./test/node-component');
    expect(component.name).to.equal('node-component');
    expect(component.repo).to.equal('azer/node-component');
    expect(component.dependencies).to.deep.equal({
      collection: 'component-collection',
      common: 'component-common'
    });
  });

});

describe('render', function(){

  it('should render components properly', function(){
    var m = eval(newModule('test/node-component/index.js').render()),
        c = new m.collection();

    expect(m.englishTime('1s')).to.equal(1000);
    expect(c.models).to.exist;
    expect(m.common.common).to.be.true;
  });

});
