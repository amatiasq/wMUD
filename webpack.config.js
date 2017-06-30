module.exports = {
  devtool: 'source-map',
  entry: './src/index.tsx',
  output: { filename: './dist/built.js' },

  resolve: {
    extensions: ['.webpack.js', '.web.js', '.ts', '.js', '.tsx', '.scss']
  },

  module: {
    rules: [{
      test: /\.tsx?$/,
      loader: 'ts-loader'
    }, {
      test: /\.scss$/,
      use: [{
        loader: "style-loader"
      }, {
        loader: "css-loader"
      }, {
        loader: "sass-loader"
      }],
    }]
  },

  devServer: {
    inline: true,
    stats: {
      colors: true,
      progress: true,
    },
  },
};
