'use strict'

const Constants = require('../constants')
const Dynamics = require('../dynamics')
const Routes = require('../routes')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const Application = require('../models/application.model')

module.exports = class StartOrOpenSavedController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)

    pageContext.cost = {
      lower: (Constants.PermitTypes.STANDARD_RULES.cost.lower).toLocaleString(),
      upper: (Constants.PermitTypes.STANDARD_RULES.cost.upper).toLocaleString()
    }

    pageContext.formValues = request.payload

    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    }

    const cookie = await CookieService.generateCookie(h)
    const { authToken } = cookie

    let nextPage
    if (request.payload['started-application'] === 'new') {
      // Create new application in Dynamics and set the applicationId in the cookie
      const application = new Application()
      application.statusCode = Dynamics.StatusCode.DRAFT
      await application.save({ authToken })

      // Set the application ID in the cookie
      cookie.applicationId = application.id

      nextPage = Routes.PERMIT_HOLDER_TYPE
    } else {
      nextPage = Routes.SEARCH_YOUR_EMAIL
    }

    return this.redirect({ request, h, redirectPath: nextPage.path, cookie })
  }
}
