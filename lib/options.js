var attrs = require("attrs"),
    log   = require('./debug')('options');

var options = exports = module.exports = attrs({
  debug   : false,
  global  : false,
  native  : false,
  tie     : {}
});

options.ignore  = [];
options.require = [];

exports.set = {
  debug   : debug,
  global  : global,
  ignore  : ignore,
  native  : native,
  tie     : tie
};

exports.set.require = function require(uri){
  log('Require %s', uri);
  options.require.push(uri);
};

function debug(){
  log('SourceURLs & verbose mode enabled');
  options.debug(true);
}

function global(){
  log('Global require enabled');
  options.global(true);
}

function ignore(filename){
  log('Ignore %s', filename);
  options.ignore.push(filename);
}

function native(){
  log('Native require enabled.');
  options.native(true);
}


function tie(alias, property){
  log('Tie %s to %s');
  options.tie[alias] = property;
}
