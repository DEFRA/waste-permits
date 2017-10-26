const config = require('./config')

let squeezeConfig = [{
  'error': '*',
  'log': '*',
  'ops': '*',
  'request': '*',
  'response': { exclude: 'public' }
}]

// Don't log when running tests
let goodOptions
if (config.nodeEnvironment !== 'test') {
  goodOptions = {
    ops: {
      // Log ops stats every 30 seconds
      interval: 30000
    },
    reporters: {
      // Output to console
      consoleReporter: [{
        module: 'good-squeeze',
        name: 'Squeeze',
        args: squeezeConfig
      }, {
        module: 'good-console',
        args: [{
          'format': 'YYYY-MM-DD HH:mm:ss',
          'utc': false
        }]
      }, 'stdout'],

      // Output to file
      fileReporter: [{
        module: 'good-squeeze',
        name: 'Squeeze',
        args: squeezeConfig
      }, {
        module: 'good-squeeze',
        name: 'SafeJson'
      }, {
        module: 'good-file',
        args: ['./log/' + config.nodeEnvironment + '.log']
      }]
    }
  }
}

module.exports = { options: goodOptions }
