var debug           = require("./debug")('module'),
    memoize         = require('memoize-sync'),

    fs              = require("fs"),
    readFile        = fs.readFileSync,
    exists          = fs.existsSync,

    dependenciesOf  = require('./dependencies-of'),
    relativesOf     = require('./relatives-of'),
    render          = require('./render'),
    requires        = require("./requires"),

    lock            = {},

    instanceCounter = 0;

module.exports = memoize(newModule);
module.exports.id = id;

function contentOf(module){
  debug('Reading %s', module);

  var content = readFile(module.filename).toString();

  if(content.substring(0,2) == '#!'){
    content = content.replace(/\#\!.+\n/, '');
  }

  return content;
}

function id(){
  return instanceCounter++;
}

function name(filename){
  var m = filename.match(/([^\/\.]+)\.js$/);
  return !m ? undefined : m[1];
}

function newModule(filename, pack, id){
  var content, module;

  if(!exists(filename)) return undefined;

  if(lock[filename]) return lock[filename];

  debug('New module: %s' + (pack ? ', ' + pack : ''), filename);

  module = {
    id       : id || instanceCounter++,
    name     : name(filename),
    map      : {},
    filename : filename,
    isModule : true
  };

  module.render   = function(){
    return render(module);
  };

  module.toString = function(){
    return '(Module #' + module.id + ' ' + module.name + ( pack ? ' pack=' + pack.toString() : '' ) + ')';
  };

  lock[filename] = module;

  module.content      = contentOf(module);
  module.requires     = requires(module);
  module.relatives    = relativesOf(module);
  module.dependencies = dependenciesOf(module);

  delete lock[filename];

  return module;
}
