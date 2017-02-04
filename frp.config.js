'use strict';
// https://github.com/frontainer/frontplate-cli/wiki/6.%E8%A8%AD%E5%AE%9A
module.exports = function(production) {
  global.FRP_SRC = 'src';
  global.FRP_DEST = 'public';
  return {
    clean: {},
    html: {},
    style: production ? {} : {},
    script: production ? {} : { },
    server: {},
    copy: {
      // blast.js
      './node_modules/blast-text/jquery.blast.min.js': './public/assets/js',
      // normalize.css
      './node_modules/normalize.css/normalize.css': './public/assets/css'
    },
    sprite: [],
    test: {}
  }
};
