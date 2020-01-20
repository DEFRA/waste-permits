'use strict'

const Constants = require('../constants')
const Dynamics = require('../dynamics')
const { SEARCH_YOUR_EMAIL, SAVE_AND_RETURN_COMPLETE } = require('../routes')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
const Application = require('../persistence/entities/application.entity')

module.exports = class StartOrOpenSavedController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    pageContext.cost = {
      lower: (Constants.PermitTypes.STANDARD_RULES.cost.lower).toLocaleString(),
      upper: (Constants.PermitTypes.STANDARD_RULES.cost.upper).toLocaleString()
    }

    pageContext.formValues = request.payload

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    let cookie
    try {
      cookie = await CookieService.generateCookie(h)
    } catch (error) {
      LoggingService.logError(error)
      return this.redirect({ h, route: SAVE_AND_RETURN_COMPLETE, error })
    }

    const { 'started-application': startedApplication } = request.payload

    if (startedApplication === 'open') {
      return this.redirect({ h, route: SEARCH_YOUR_EMAIL, cookie })
    }

    // Create new application in Dynamics and set the applicationId in the cookie
    const application = new Application()
    application.statusCode = Dynamics.StatusCode.DRAFT
    await application.save({ })

    // Set the application ID in the cookie
    cookie.applicationId = application.id

    return this.redirect({ h, cookie })
  }
}
