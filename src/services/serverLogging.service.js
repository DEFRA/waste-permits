'use strict'

module.exports = class ServerLoggingService {
  static logError (message) {
    const server = require('../../server')
    server.log('ERROR', message)
  }

  static logInfo (message) {
    const server = require('../../server')
    server.log('INFO', message)
  }
}
