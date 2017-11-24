'use strict'

const Constants = require('../constants')
const LoggingService = require('../services/logging.service')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const StartOrOpenSavedValidator = require('../validators/startOrOpenSaved.validator')
const Application = require('../models/application.model')

module.exports = class StartOrOpenSavedController extends BaseController {
  async doGet (request, reply, errors) {
    try {
      const pageContext = this.createPageContext(errors, StartOrOpenSavedValidator)

      pageContext.cost = {
        lower: (Constants.PermitTypes.STANDARD_RULES.cost.lower).toLocaleString(),
        upper: (Constants.PermitTypes.STANDARD_RULES.cost.upper).toLocaleString()
      }

      pageContext.formValues = request.payload

      return reply
        .view('startOrOpenSaved', pageContext)
    } catch (error) {
      LoggingService.logError(error)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    }

    const cookie = await CookieService.generateCookie(reply)

    let nextPage
    if (request.payload['started-application'] === 'new') {
      // Create new application in Dynamics and set the applicationId in the cookie
      try {
        const application = new Application()
        await application.save(cookie.authToken)

        // Set the application ID in the cookie
        cookie.applicationId = application.id

        nextPage = Constants.Routes.PERMIT_CATEGORY
      } catch (error) {
        LoggingService.logError(error)
        return reply.redirect(Constants.Routes.ERROR.path)
      }
    } else {
      nextPage = Constants.Routes.CHECK_YOUR_EMAIL
    }

    return reply
      .redirect(nextPage.path)

      // Delete the existing session cookie (if there is one)
      .unstate(Constants.COOKIE_KEY, Constants.COOKIE_PATH)

      // Add the new cookie
      .state(Constants.COOKIE_KEY, cookie, Constants.COOKIE_PATH)
  }

  handler (request, reply, source, errors) {
    return super.handler(request, reply, source, errors, false)
  }
}
