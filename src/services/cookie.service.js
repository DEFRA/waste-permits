'use strict'

module.exports = class CookieService {
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
