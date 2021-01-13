const path = require('path')
const common = require('./env/common')

const env = process.env.BCH_ENV || 'development'
const route = path.join(__dirname, 'env', env.trim())
const config = require(route)

module.exports = module.exports = Object.assign({}, common, config)
