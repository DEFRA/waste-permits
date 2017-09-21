const config = require('./config')

// Don't require CSRF tokens when running tests
let crumbOptions
if (config.nodeEnvironment === 'test') {
  crumbOptions = { skip: function () { return true } }
} else {
  crumbOptions = {}
}

module.exports = { options: crumbOptions }
