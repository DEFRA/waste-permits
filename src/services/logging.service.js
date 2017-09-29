'use strict'

const Constants = require('../constants')

module.exports = class LoggingService {
  static logError (message, request) {
    console.error(message)
    LoggingService._log(Constants.LogLevel.ERROR, message, request)
  }

  static logInfo (message, request) {
    LoggingService._log(Constants.LogLevel.INFO, message, request)
  }

  static _log (level, message, request) {
    if (request) {
      request.log(level, message)
    } else {
      const server = require('../../server')
      server.log(level, message)
    }
  }
}
