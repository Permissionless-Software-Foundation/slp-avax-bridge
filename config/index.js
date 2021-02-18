const path = require('path')
const common = require('./env/common')

const env = process.env.BCH_ENV || 'development'
const route = path.join(__dirname, 'env', env.trim())
const config = require(route)
// trim the space at the end of variables in windows
for (const key in config) {
  config[key] = config[key].trim()
}

module.exports = module.exports = Object.assign({}, common, config)
