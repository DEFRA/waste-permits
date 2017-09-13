'use strict'

const Constants = require('../constants')
const ServerLoggingService = require('../services/serverLogging.service')
const CookieService = require('../services/cookie.service')
const BaseController = require('./base.controller')
const StartOrOpenSavedValidator = require('../validators/startOrOpenSaved.validator')
const Application = require('../models/application.model')

module.exports = class StartOrOpenSavedController extends BaseController {
  static async doGet (request, reply, errors) {
    try {
      const pageContext = BaseController.createPageContext(Constants.Routes.START_OR_OPEN_SAVED, errors, StartOrOpenSavedValidator)

      pageContext.cost = {
        lower: (Constants.PermitTypes.STANDARD_RULES.cost.lower).toLocaleString(),
        upper: (Constants.PermitTypes.STANDARD_RULES.cost.upper).toLocaleString()
      }

      pageContext.formValues = request.payload

      return reply
        .view('startOrOpenSaved', pageContext)
    } catch (error) {
      ServerLoggingService.logError(error)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  static async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return StartOrOpenSavedController.doGet(request, reply, errors)
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
        ServerLoggingService.logError(error)
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

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, StartOrOpenSavedController, false)
  }
}
