'use strict'

const Constants = require('../constants')
const Dynamics = require('../dynamics')
const Routes = require('../routes')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
const Application = require('../persistence/entities/application.entity')
const { BESPOKE: { id: BESPOKE }, STANDARD_RULES: { id: STANDARD_RULES } } = Constants.PermitTypes

module.exports = class StartOrOpenSavedController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    pageContext.cost = {
      lower: (Constants.PermitTypes.STANDARD_RULES.cost.lower).toLocaleString(),
      upper: (Constants.PermitTypes.STANDARD_RULES.cost.upper).toLocaleString()
    }

    pageContext.formValues = request.payload

    // If there is a permit type parameter indicating bespoke or standard rules then pass it through
    const permitType = request.query['permit-type']
    pageContext.formActionQueryString = ''
    if (permitType && (permitType === BESPOKE || permitType === STANDARD_RULES)) {
      pageContext.formActionQueryString = `?permit-type=${permitType}`
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    let cookie
    try {
      cookie = await CookieService.generateCookie(h)
    } catch (error) {
      LoggingService.logError(error)
      return this.redirect({ h, route: Routes.SAVE_AND_RETURN_COMPLETE, error })
    }

    const { authToken } = cookie

    let path
    if (request.payload['started-application'] === 'new') {
      // Create new application in Dynamics and set the applicationId in the cookie
      const application = new Application()
      application.statusCode = Dynamics.StatusCode.DRAFT
      await application.save({ authToken })

      // Set the application ID in the cookie
      cookie.applicationId = application.id

      path = Routes.BESPOKE_OR_STANDARD_RULES.path

      // If there is a permit type parameter indicating bespoke or standard rules then pass it through
      const permitType = request.query['permit-type']
      if (permitType && (permitType === BESPOKE || permitType === STANDARD_RULES)) {
        path = `${path}?permit-type=${permitType}`
      }
    } else {
      path = Routes.SEARCH_YOUR_EMAIL.path
    }

    return this.redirect({ h, path, cookie })
  }
}
