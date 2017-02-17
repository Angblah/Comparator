var webpack = require("webpack");
var path = require("path");
 
module.exports = {
  module: {
    loaders: [
      {
        loader: "babel-loader",
        // Skip any files outside of your project's `src` directory
        include: [
          path.resolve(__dirname, "project/static/scripts/jsx/"),
        ],
        // Only run `.js` and `.jsx` files through Babel
        test: /\.jsx?$/,
        // Options to configure babel wisth
        query: {
          plugins: ['transform-runtime'],
          presets: ['es2015', 'react'],
        }
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, "project/static/scripts/js/"),
    filename: '[name].bundle.js'
  },
  entry: {
      trial: './project/static/scripts/jsx/main.js',
      workspace: './project/static/scripts/jsx/workspace2.js',
      dashboard: './project/static/scripts/jsx/profileHomePage.js',
      testbed: './project/static/scripts/jsx/workspace3.js'
  }
};