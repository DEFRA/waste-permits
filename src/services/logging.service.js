'use strict'

module.exports = class ActiveDirectoryAuthService {
  logError (message) {
    const server = require('../../server')
    server.log('ERROR', message)
  }

  logInfo (message) {
    const server = require('../../server')
    server.log('INFO', message)
  }
}
