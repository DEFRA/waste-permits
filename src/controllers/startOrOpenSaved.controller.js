'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const Application = require('../models/application.model')

module.exports = class StartOrOpenSavedController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)

    pageContext.cost = {
      lower: (Constants.PermitTypes.STANDARD_RULES.cost.lower).toLocaleString(),
      upper: (Constants.PermitTypes.STANDARD_RULES.cost.upper).toLocaleString()
    }

    pageContext.formValues = request.payload

    // For MVP we are only supporting the mobile plant standard rules waste permit
    // return this.showView(request, reply, 'startOrOpenSaved', pageContext)

    return this.showView(request, reply, 'startOrOpenSavedMobile', pageContext)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.details) {
      return this.doGet(request, reply, errors)
    }

    const cookie = await CookieService.generateCookie(reply)

    let nextPage
    if (request.payload['started-application'] === 'new') {
      // Create new application in Dynamics and set the applicationId in the cookie
      const application = new Application()
      await application.save(cookie.authToken)

      // Set the application ID in the cookie
      cookie.applicationId = application.id

      // NB - This is temporary, eventually it will go to Constants.Routes.PERMIT_CATEGORY
      nextPage = Constants.Routes.PERMIT_SELECT
    } else {
      nextPage = Constants.Routes.CHECK_YOUR_EMAIL
    }

    return this.redirect(request, reply, nextPage.path, cookie)
  }
}
