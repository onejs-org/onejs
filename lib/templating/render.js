var hogan  = require('hogan.js');

module.exports = render;

function render(template, views, partials, callback){
  var output;

  try {
    template = hogan.compile(template);
    output = template.render(views, partials);
  } catch (mustacheError) {
    callback(mustacheError);
    return;
  }

  callback(undefined, output);
}
