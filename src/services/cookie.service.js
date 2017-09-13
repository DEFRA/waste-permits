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

  static validateCookie (cookie) {
    if (!cookie) {
      throw new Error('Unable to validate undefined cookie')
    }

    let isValid = false
    const applicationId = cookie.applicationId
    if (applicationId) {
      // TODO - Call persistence layer to validate the applicationId
      // e.g.
      // result = dynamics.validateApplicationId(applicationId)
      if (applicationId.length > 0) {
        isValid = true
      }
    }
    return isValid
  }
}
