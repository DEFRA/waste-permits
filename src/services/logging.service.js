'use strict'

const Config = require('../config/config')
const Constants = require('../constants')
const {ERROR, INFO, DEBUG} = Constants.LogLevels

module.exports = class LoggingService {
  static logError (message, request) {
    LoggingService._log(ERROR, message, request)
  }

  static logInfo (message, request) {
    if (Config.LOG_LEVEL !== DEBUG) {
      LoggingService._log(INFO, message, request)
    }
  }

  static logDebug (message, data, request) {
    if (Config.LOG_LEVEL === DEBUG) {
      if (message) {
        LoggingService._log(DEBUG, message, request)
      }
      if (data) {
        LoggingService._log(DEBUG, data, request)
      }
    }
  }

  static _log (level, message, request) {
    if (Config.isTest) {
      return
    }
    if (request && request.log) {
      request.log(level, message)
    } else {
      const server = require('../../server')
      server.log(level, message)
    }
  }
}
