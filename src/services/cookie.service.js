'use strict'

const Constants = require('../constants')
const ServerLoggingService = require('../services/serverLogging.service')
const ActiveDirectoryAuthService = require('../services/activeDirectoryAuth.service')
const authService = new ActiveDirectoryAuthService()

module.exports = class CookieService {
  static async generateCookie (reply) {
    try {
      // Generate a CRM token
      let authToken = await authService.getToken()

      // Create the cookie
      return {
        applicationId: undefined,
        authToken: authToken
      }
    } catch (error) {
      ServerLoggingService.logError(error)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  static validateCookie (request) {
    let isValid = false
    const cookie = request.state[Constants.COOKIE_KEY]
    if (!cookie) {
      request.log('INFO', `${request.path}: Unable to validate undefined cookie`)
    } else {
      const applicationId = cookie.applicationId
      if (applicationId) {
        // TODO - Determine if we are going to call Dynamics to validate the applicationId
        // e.g.
        // isValid = dynamics.validateApplicationId(applicationId)
        if (applicationId.length > 0) {
          isValid = true
        } else {
          request.log('INFO', `${request.path}: Invalid application ID [${applicationId}]`)
        }
      } else {
        request.log('INFO', `${request.path}: Missing application ID`)
      }
    }

    return isValid
  }
}
