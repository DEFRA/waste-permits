'use strict'

const Constants = require('../constants')
const LoggingService = require('../services/logging.service')
const ActiveDirectoryAuthService = require('../services/activeDirectoryAuth.service')
const authService = new ActiveDirectoryAuthService()

module.exports = class CookieService {
  static async generateCookie (reply) {
    try {
      // Generate a CRM token
      const authToken = await authService.getToken()

      // Create the cookie
      return {
        applicationId: undefined,
        authToken: authToken
      }
    } catch (error) {
      LoggingService.logError(error)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  static validateCookie (request) {
    let isValid = false
    const cookie = request.state[Constants.COOKIE_KEY]
    if (!cookie) {
      LoggingService.logInfo(`${request.path}: Unable to validate undefined cookie`, request)
    } else {
      const applicationId = cookie.applicationId
      if (applicationId) {
        // TODO - Determine if we are going to call Dynamics to validate the applicationId
        // e.g.
        // isValid = dynamics.validateApplicationId(applicationId)
        if (applicationId.length > 0) {
          isValid = true
        } else {
          LoggingService.logInfo(`${request.path}: Invalid application ID [${applicationId}]`, request)
        }
      } else {
        LoggingService.logInfo(`${request.path}: Missing application ID`, request)
      }
    }
    return isValid
  }

  static getAuthToken (request) {
    let authToken
    if (request.state[Constants.COOKIE_KEY]) {
      authToken = request.state[Constants.COOKIE_KEY].authToken
    }
    return authToken
  }

  static getApplicationId (request) {
    let applicationId
    if (request.state[Constants.COOKIE_KEY]) {
      applicationId = request.state[Constants.COOKIE_KEY].applicationId
    }
    return applicationId
  }
}
