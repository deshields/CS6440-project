const path = require('path');
var BundleTracker = require('webpack-bundle-tracker');

module.exports = {
    context: __dirname,
    entry: './application/django_react/static/hd/js/index',
    stats: "detailed",
    output: {
        filename: '[name]-[hash].js',
        path: path.resolve("./application/django_react/static/hd/bundles/"),
    },
    plugins: [
      new BundleTracker({
        filename: './application/webpack-stats.json',
      }),
    ],
    module: {
        rules: [
          {
            test: /\.js?$/,
            exclude: /node_modules/,
            use: ["babel-loader"]
          },
          {
            test: /\.css$/,
            use: ["style-loader", "css-loader"]
          },
          {
            test: /\.(gif|png|jpg|svg|woff|ttf|eot|woff2)([\?]?.*)$/,
            use: [
              {
                loader: "url-loader",
                options: {
                  limit: 10000
                }
              }
            ]
          }
        ]
      },
      resolve: {
        extensions: ["*", ".js", ".jsx"]
      }
};