// webpack.config.js

const path = require('path')

module.exports = {
  entry: './src/app.js', // Your entry file
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'), // Output directory
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  mode: 'development', // or 'production' for minified output
}
