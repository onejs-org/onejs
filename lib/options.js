var attrs = require("attrs"),
    log   = require('./debug')('options');

var options = exports = module.exports = attrs({
  debug   : false,
  global  : false,
  tie     : {}
});

options.require = [];
options.ignore  = [];

exports.set = {
  debug   : debug,
  global  : global,
  ignore  : ignore,
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

function tie(alias, property){
  log('Tie %s to %s');
  options.tie[alias] = property;
}
