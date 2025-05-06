const { merge } = require('webpack-merge')
const common = require('./webpack.common')

const dev = {
  mode: 'development',
  stats: 'errors-warnings',
  devtool: 'eval',
  devServer: {
    open: true,
    allowedHosts: 'all'
  }
}

module.exports = merge(common, dev)
