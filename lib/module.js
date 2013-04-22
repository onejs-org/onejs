var debug           = require("./debug")('module'),
    memoize         = require('memoize-sync'),

    fs              = require("fs"),
    readFile        = fs.readFileSync,
    exists          = fs.existsSync,

    dependenciesOf  = require('./dependencies-of'),
    relativesOf     = require('./relatives-of'),
    render          = require('./render'),
    requires        = require("./requires"),

    instanceCounter = 0;

module.exports = memoize(newModule);

function contentOf(module){
  debug('Reading %s', module);

  var content = readFile(module.filename).toString();

  if(content.substring(0,2) == '#!'){
    content = content.replace(/\#\!.+\n/, '');
  }

  return content;
}

function name(filename){
  var m = filename.match(/([^\/\.]+)\.js$/);
  return !m ? undefined : m[1];
}

function newModule(filename, pack){
  var content, module;

  if(!exists(filename)) return undefined;

  debug('New module: %s' + (pack ? ', ' + pack : ''), filename);

  module = {
    id       : instanceCounter++,
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

  module.content      = contentOf(module);
  module.requires     = requires(module);
  module.relatives    = relativesOf(module);
  module.dependencies = dependenciesOf(module);

  return module;
}
