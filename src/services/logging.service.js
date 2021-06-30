'use strict'

const Config = require('../config/config')
const Constants = require('../constants')
const AirbrakeClient = require('airbrake-js')
const { ERROR, INFO, DEBUG } = Constants.LogLevels

let airbrake
const log = (level, message, request) => {
  if (request && request.log) {
    request.log(level, message)
  } else {
    const server = require('../../server')
    server.log(level, message)
  }
}

module.exports = class LoggingService {
  static get airbrake () {
    if (!airbrake) {
      if (Config.ERRBIT_ENABLED) {
        airbrake = new AirbrakeClient({ projectId: true, projectKey: Config.ERRBIT_API_KEY, host: Config.ERRBIT_HOST })
      } else {
        airbrake = {
          notify: (message) => {
            log(ERROR, `airbrake: ${message}`)
          }
        }
      }
    }
    return airbrake
  }

  static logError (message, request) {
    LoggingService._log(ERROR, message, request)
  }

  static logInfo (message, request) {
    LoggingService._log(INFO, message, request)
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

  static async _log (level, error, request) {
    if (Config.isTest) {
      return
    }
    if (level === ERROR) {
      if (typeof error === 'object') {
        await LoggingService.airbrake.notify(JSON.stringify(error))
      } else {
        await LoggingService.airbrake.notify(error)
      }
    }
    log(level, error, request)
  }
}
