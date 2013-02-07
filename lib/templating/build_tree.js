var flattenPkgTree = require('./flatten');

module.exports = buildTree;

function buildTree(root, options){
  var trees      = {},
      flat       = flattenPkgTree(root).sort(sort),
      save       = options.save,
      mainTarget = save[root.name].to;

  flat.forEach(function(el){
    var target = save[el.name] && save[el.name].to,
        parent;

    if(!target && el.parents.length > 1){
      target = mainTarget;
    }

    if(!target && el.parents.length == 1){
      parent = el.parents[0];
      while(parent){

        if(save[parent.name]){
          target = save[parent.name].to;
          break;
        } else if(parent.parents.length == 1){
          parent = parent.parents[0];
          continue;
        }

        target = mainTarget;
        break;
      }
    }

    trees[target] || ( trees[target] = [] );
    trees[target].push(el);
  });

  return trees;
}

function sort(a, b){
  return a.name.localeCompare(b.name);
}
