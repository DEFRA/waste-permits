'use strict'

const Config = require('../config/config')
const Constants = require('../constants')

module.exports = class LoggingService {
  static logError (message, request) {
    console.error(message)
    LoggingService._log(Constants.LogLevel.ERROR, message, request)
  }

  static logInfo (message, request) {
    LoggingService._log(Constants.LogLevel.INFO, message, request)
  }

  static logDebug (message, data, request) {
    if (Config.LOG_LEVEL === Constants.LogLevel.DEBUG) {
      if (message) {
        LoggingService._log(Constants.LogLevel.DEBUG, message, request)        
      }
      if (data) {
        LoggingService._log(Constants.LogLevel.DEBUG, data, request)
      }
    }
  }

  static _log (level, message, request) {
    if (request && request.log) {
      request.log(level, message)
    } else {
      const server = require('../../server')
      server.log(level, message)
    }
  }
}
