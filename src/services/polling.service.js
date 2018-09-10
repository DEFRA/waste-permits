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
    try {
      const configurations = await Configuration.listBy({ authToken })
      if (configurations && configurations.length) {
        configurations.forEach(({ title, status }) => LoggingService.logInfo(`Polling Dynamics: Configured instance "${title}" found with a status of "${status}"`))
      } else {
        throw new Error('No Configurations found')
      }
    } catch (error) {
      LoggingService.logError(`Polling Dynamics: failed: ${error.message}`)
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
