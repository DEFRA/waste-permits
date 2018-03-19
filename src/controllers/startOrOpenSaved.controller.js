'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const Application = require('../models/application.model')

module.exports = class StartOrOpenSavedController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)

    pageContext.cost = {
      lower: (Constants.PermitTypes.STANDARD_RULES.cost.lower).toLocaleString(),
      upper: (Constants.PermitTypes.STANDARD_RULES.cost.upper).toLocaleString()
    }

    pageContext.formValues = request.payload

    // For MVP we are only supporting the mobile plant standard rules waste permit
    // return this.showView(request, h, 'startOrOpenSaved', pageContext)

    return this.showView(request, h, 'startOrOpenSavedMobile', pageContext)
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    }

    const cookie = await CookieService.generateCookie(h)

    let nextPage
    if (request.payload['started-application'] === 'new') {
      // Create new application in Dynamics and set the applicationId in the cookie
      const application = new Application()
      application.statusCode = Constants.Dynamics.StatusCode.DRAFT
      await application.save(cookie.authToken)

      // Set the application ID in the cookie
      cookie.applicationId = application.id

      nextPage = Constants.Routes.PERMIT_HOLDER_TYPE
    } else {
      nextPage = Constants.Routes.CHECK_YOUR_EMAIL
    }

    return this.redirect(request, h, nextPage.path, cookie)
  }
}
