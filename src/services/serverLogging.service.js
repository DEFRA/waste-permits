'use strict'

const Constants = require('../constants')

module.exports = class ServerLoggingService {
  static logError (message) {
    console.error('ERROR: ', message)
    const server = require('../../server')
    server.log(Constants.LogLevel.ERROR, message)
  }

  static logInfo (message) {
    const server = require('../../server')
    server.log(Constants.LogLevel.INFO, message)
  }
}
