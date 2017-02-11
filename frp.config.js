'use strict';
// https://github.com/frontainer/frontplate-cli/wiki/6.%E8%A8%AD%E5%AE%9A
module.exports = function(production) {
  global.FRP_SRC = 'src';
  global.FRP_DEST = 'dev';
  return {
    clean: {},
    html: {},
    style: production ? {
        dest: FRP_DEST
      } : {
        dest: FRP_DEST
      },
    script: production ? {} : {},
    server: {},
    copy: {},
    sprite: [],
    test: {}
  }
};
