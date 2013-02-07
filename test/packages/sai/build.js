var one = require('../../../lib');

one('./package.json')
    .alias('crypto', 'crypto-browserify')
    .tie('pi', 'Math.PI')
    .tie('json', 'JSON')
    .exclude('underscore')
    .filter(/^build/)
    .filter(/^bundle/)
    .save('bundle.js');
