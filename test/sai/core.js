module.exports.core = !!require('tty').isatty && !!require('vm').runInNewContext && !!require('buffer');
