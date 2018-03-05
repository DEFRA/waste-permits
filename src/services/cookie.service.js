'use strict'

const config = require('../config/config')
const Constants = require('../constants')
const LoggingService = require('../services/logging.service')
const ActiveDirectoryAuthService = require('../services/activeDirectoryAuth.service')
const authService = new ActiveDirectoryAuthService()
const {COOKIE_RESULT} = require('../constants')

module.exports = class CookieService {
  static _calculateExpiryDate () {
    return Date.now() + config.cookieTimeout
  }

  static async generateCookie (reply) {
    try {
      // Generate a CRM token
      const authToken = await authService.getToken()

      // Create the cookie and set the cookie Time to Live (TTL)
      return {
        [Constants.COOKIE_KEY.APPLICATION_ID]: undefined,
        [Constants.COOKIE_KEY.AUTH_TOKEN]: authToken,
        [Constants.COOKIE_KEY.EXPIRY]: this._calculateExpiryDate()
      }
    } catch (error) {
      LoggingService.logError(error)
      return reply.redirect(Constants.Routes.ERROR.TECHNICAL_PROBLEM.path)
    }
  }

  static async validateCookie (request) {
    let isValid = true
    let result
    const cookie = request.state[Constants.DEFRA_COOKIE_KEY]

    // Ensure that the cookie exists
    if (isValid && !cookie) {
      LoggingService.logInfo(`${request.path}: Cookie not found`, request)
      result = COOKIE_RESULT.COOKIE_NOT_FOUND
      isValid = false
    }

    // Check the Cookie Time to Live
    if (isValid && (!cookie.expiry || cookie.expiry < Date.now())) {
      LoggingService.logInfo(`${request.path}: Cookie has expired`, request)
      result = COOKIE_RESULT.COOKIE_EXPIRED
      isValid = false
    }

    // Check the Application ID in the cookie
    if (isValid) {
      const applicationId = cookie.applicationId
      if (!applicationId || applicationId.length === 0) {
        LoggingService.logInfo(`${request.path}: Invalid application ID`, request)
        result = COOKIE_RESULT.APPLICATION_NOT_FOUND
        isValid = false
      }
    }

    if (isValid) {
      result = COOKIE_RESULT.VALID_COOKIE

      // Update the cookie TTL and generate a new CRM token
      CookieService.set(request, Constants.COOKIE_KEY.AUTH_TOKEN, await authService.getToken())
      CookieService.set(request, Constants.COOKIE_KEY.EXPIRY, await CookieService._calculateExpiryDate())
    }

    return result
  }

  static get (request, key) {
    let value
    if (request.state[Constants.DEFRA_COOKIE_KEY]) {
      value = request.state[Constants.DEFRA_COOKIE_KEY][key]
    }
    return value
  }

  static set (request, key, value) {
    if (request.state[Constants.DEFRA_COOKIE_KEY]) {
      request.state[Constants.DEFRA_COOKIE_KEY][key] = value
    }
  }
}
