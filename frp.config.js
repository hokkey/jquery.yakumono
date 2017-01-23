'use strict';
// https://github.com/frontainer/frontplate-cli/wiki/6.%E8%A8%AD%E5%AE%9A
module.exports = function(production) {
  global.FRP_SRC = 'src';
  global.FRP_DEST = 'public';
  return {
    clean: {},
    html: {},
    style: production ? {} : {},
    script: production ? {
      resolve: {
        modules: [
          `${FRP_SRC}/js`,
          path.join(process.cwd(), 'node_modules'),
          path.join(__dirname, '../node_modules'),
          "node_modules"
        ],
      },
      resolveLoader: {
        modules: [
          path.join(process.cwd(), 'node_modules'),
          path.join(__dirname, '../node_modules'),
          "node_modules"
        ]
      },
      module: {
        rules: [
          {test: /\.js$/, exclude: /node_modules/, loader: 'eslint-loader', enforce: 'pre'},
          {test: /\.html$/, loader: 'html-loader'},
          {test: /\.json$/, loader: 'json-loader'},
        ]
      },
      plugins: [
        new WebpackBuildNotifierPlugin({
          title: "frp task script",
          suppressSuccess: true
        }),
        new webpack.LoaderOptionsPlugin({
          options: {
            eslint: {
              configFile: util.exists(localConfig) ? localConfig : globalConfig,
              failOnError: true
            },
            babel: {
              presets: ["es2015"]
            }
          }
        })
      ],
      watchOptions: {
        ignored: /node_modules/
      },
      performance: {
        hints: false
      }
    } : { },
    server: {},
    copy: {},
    sprite: [],
    test: {}
  }
};
