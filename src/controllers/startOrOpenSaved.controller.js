'use strict'

const Constants = require('../constants')
const Dynamics = require('../dynamics')
const Routes = require('../routes')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const Application = require('../persistence/entities/application.entity')
const DataStore = require('../models/dataStore.model')
const { BESPOKE: { id: BESPOKE }, STANDARD_RULES: { id: STANDARD_RULES } } = Constants.PermitTypes

module.exports = class StartOrOpenSavedController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)

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

    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    }

    const cookie = await CookieService.generateCookie(h)
    const { authToken } = cookie

    let redirectPath
    if (request.payload['started-application'] === 'new') {
      // Create new application in Dynamics and set the applicationId in the cookie
      const application = new Application()
      application.statusCode = Dynamics.StatusCode.DRAFT
      const permitType = request.query['permit-type']
      const context = { authToken }
      await application.save(context)

      // Set the application ID in the cookie
      cookie.applicationId = application.id

      redirectPath = Routes.BESPOKE_OR_STANDARD_RULES.path

      // Save the permit type in the Data store
      context.applicationId = application.id
      // Save the permit type in the Data store
      await DataStore.save(context, { permitType })

      // If there is a permit type parameter indicating bespoke or standard rules then pass it through
      if (permitType && (permitType === BESPOKE || permitType === STANDARD_RULES)) {
        redirectPath = `${redirectPath}?permit-type=${permitType}`
      }
    } else {
      redirectPath = Routes.SEARCH_YOUR_EMAIL.path
    }

    return this.redirect({ request, h, redirectPath, cookie })
  }
}
