// webpack.config.js

const path = require('path')

module.exports = {
  entry: './src/app.js', // Your entry file
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'), // Output directory
  },
  resolve: {
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      fs: false, // if you want to leave it as an empty module
      http: require.resolve('stream-http'),
      path: require.resolve('path-browserify'),
      zlib: require.resolve('browserify-zlib'),
      timers: require.resolve('timers-browserify'),
      querystring: false,
      net: false,
      tls: false,
      buffer: require.resolve('buffer/'),
      util: require.resolve('util/'),
      https: require.resolve('https-browserify'),
      assert: require.resolve('assert/'),
      vm: require.resolve('vm-browserify'),
      async_hooks: false, // If you don't need async_hooks, set it to false
      bufferutil: false, // If you don't need bufferutil, set it to false
    },
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
