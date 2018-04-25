'use strict'

const Configuration = require('../models/configuration.model')
const ActiveDirectoryAuthService = require('./activeDirectoryAuth.service')
const LoggingService = require('./logging.service')
const authService = new ActiveDirectoryAuthService()

let timeout
let timeoutId
let delayStart = 30000

module.exports = class PollingService {
  static async poll () {
    LoggingService.logInfo('Polling Dynamics')
    // Generate a CRM token
    const authToken = await authService.getToken()
    const configurations = await Configuration.list(authToken)
    if (configurations && configurations.length) {
      configurations.forEach(({title, status}) => LoggingService.logInfo(`Polling Dynamics: Configured instance "${title}" found with a status of "${status}"`))
    } else {
      LoggingService.logInfo(`Polling Dynamics: failed`)
    }

    timeoutId = setTimeout(PollingService.poll, timeout)
  }

  static async start (delay) {
    timeout = delay
    return new Promise((resolve) => {
      setTimeout(async () => {
        await PollingService.poll()
        resolve()
      }, delayStart)
    })
  }

  static stop () {
    clearInterval(timeoutId)
    LoggingService.logInfo('Polling Dynamics: stopped')
  }
}
