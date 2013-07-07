var debug           = require("./debug")('module'),
    memoize         = require('memoize-sync'),

    fs              = require("fs"),
    readFile        = fs.readFileSync,
    exists          = fs.existsSync,

    path            = require('path'),
    uncompress      = require('compress-buffer').uncompress,

    dependenciesOf  = require('./dependencies-of'),
    relativesOf     = require('./relatives-of'),
    render          = require('./render'),
    requires        = require("./requires"),

    isJSON          = require('./is-json'),
    newJSONModule   = require('./json-module'),

    options         = require('./options'),

    lock            = {},

    instanceCounter = 0;

module.exports = memoize(newModule);
module.exports.id = id;

function contentOf(module){
  debug('Reading %s%s', module, module.pack.component ? ' [component]' : '');

  var content = readFile(module.filename),
      uncompressed;

  if ( module.pack.component && ( uncompressed = uncompress(content) ) ) {
    content = uncompressed;
  }

  content = content.toString();

  if(content.substring(0,2) == '#!'){
    content = content.replace(/\#\!.+\n/, '');
  }

  return content;
}

function id(){
  return instanceCounter++;
}

function nameOf(filename){
  var m = filename.match(/([^\/\.]+)\.js(?:on)?$/);
  return !m ? undefined : m[1];
}

function newModule(filename, pack, id, isEntry){
  var content, module;

  id != undefined || ( id = instanceCounter++ );

  if(!exists(filename)) return undefined;
  if(isJSON(filename)) return newJSONModule(id, nameOf(filename), filename);
  if(lock[filename]) return lock[filename];

  debug('New module: %s' + (pack ? ', ' + pack : ''), filename);

  module = {
    id        : id,
    init      : init,
    name      : nameOf(filename),
    map       : {},
    filename  : filename,
    isModule  : true
  };

  module.pack = pack || require('./package-of')(module);

  module.render   = function(callback){
    return render(module, callback);
  };

  module.toString = function(){
    return '(Module #' + module.id + ' ' + module.name + ( pack ? ' pack=' + pack.toString() : '' ) + ')';
  };

  module.content  = contentOf(module);
  module.requires = requires(module);
  module.init();

  return module;

  function init () {
    if(lock[filename]) return lock[filename];

    lock[filename]      = module;
    module.relatives    = relativesOf(module);
    module.dependencies = dependenciesOf(module);


    if(isEntry && options.global()){
      module.map[pack.name] = pack.id;
    }

    delete lock[filename];

    return module;
  }
}
