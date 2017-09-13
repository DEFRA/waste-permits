'use strict'

const Constants = require('../constants')
const ServerLoggingService = require('../services/serverLogging.service')

// Used for generating a session id which is saved as a cookie
const uuid4 = require('uuid/v4')
const CookieService = require('../services/cookie.service')
const ActiveDirectoryAuthService = require('../services/activeDirectoryAuth.service')
const authService = new ActiveDirectoryAuthService()

module.exports = class BaseController {
  static createPageContext (route, errors, ValidatorSubClass) {
    const pageContext = {
      pageTitle: Constants.buildPageTitle(route.pageHeading),
      pageHeading: route.pageHeading,
      formAction: route.path
    }

    if (errors && errors.data.details) {
      new ValidatorSubClass().addErrorsToPageContext(errors, pageContext)

      // Add the error prefix to the page title
      pageContext.pageTitle = `${Constants.PAGE_TITLE_ERROR_PREFIX} ${pageContext.pageTitle}`
    }

    return pageContext
  }

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

    // TODO: Confirm how session handling will work and where the most
    // appropriate point is to create and destroy session cookies

    const cookie = {
      applicationId: applicationId,
      authToken: authToken
    }

    return cookie
  }

  static handler (request, reply, errors, controllerSubclass, cookieValidationRequired = true) {
    if (cookieValidationRequired) {
      const cookie = request.state[Constants.COOKIE_KEY]

      // Validate the cookie
      if (!CookieService.validateCookie(cookie)) {
        // Redirect off an error screen
        ServerLoggingService.logError(`${request.path}: Invalid token. Re-directing to the error screen`)

        return reply.redirect(Constants.Routes.ERROR.path)
      }
    }
    if (request.method.toUpperCase() === 'GET') {
      return controllerSubclass.doGet(request, reply, errors)
    } else if (request.method.toUpperCase() === 'POST') {
      return controllerSubclass.doPost(request, reply, errors)
    }
  }
}
