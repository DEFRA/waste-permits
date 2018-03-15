'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const StandardRule = require('../models/standardRule.model')
const ApplicationLine = require('../models/applicationLine.model')

module.exports = class PermitSelectController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const {authToken, application, payment} = await this.createApplicationContext(request, {application: true, payment: true})

    const redirectPath = await this.checkRouteAccess(application, payment)
    if (redirectPath) {
      return this.redirect(request, h, redirectPath)
    }

    pageContext.formValues = request.payload

    pageContext.standardRules = await StandardRule.list(authToken)
    pageContext.permitCategoryRoute = Constants.Routes.PERMIT_CATEGORY.path

    return this.showView(request, h, 'permitSelect', pageContext)
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const {authToken, applicationId} = await this.createApplicationContext(request)

      // Look up the Standard Rule based on the chosen permit type
      const standardRule = await StandardRule.getByCode(authToken, request.payload['chosen-permit'])

      // Create a new Application Line in Dynamics and set the applicationLineId in the cookie
      const applicationLine = new ApplicationLine({
        applicationId: applicationId,
        standardRuleId: standardRule.id,
        parametersId: undefined
      })

      await applicationLine.save(authToken)

      // Set the application ID in the cookie
      CookieService.set(request, Constants.COOKIE_KEY.APPLICATION_LINE_ID, applicationLine.id)

      return this.redirect(request, h, Constants.Routes.TASK_LIST.path)
    }
  }
}
