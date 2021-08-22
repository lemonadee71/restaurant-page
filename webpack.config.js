const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: `main.js`,
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    hot: 'only',
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: 'asset/resources',
      },
    ],
  },
};
