'use strict'

// Used for generating a session id which is saved as a cookie
const uuid4 = require('uuid/v4')

const Constants = require('../constants')
const ServerLoggingService = require('../services/serverLogging.service')
const ActiveDirectoryAuthService = require('../services/activeDirectoryAuth.service')
const authService = new ActiveDirectoryAuthService()

module.exports = class CookieService {
  static async generateCookie (reply) {
    // Generate an application ID
    const applicationId = uuid4()

    // Generate a CRM token
    let authToken
    try {
      authToken = await authService.getToken()
    } catch (error) {
      ServerLoggingService.logError(error)
      return reply.redirect(Constants.Routes.ERROR.path)
    }

    return {
      applicationId: applicationId,
      authToken: authToken
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
