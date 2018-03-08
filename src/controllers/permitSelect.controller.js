'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const StandardRule = require('../models/standardRule.model')
const Application = require('../models/application.model')
const ApplicationLine = require('../models/applicationLine.model')

module.exports = class PermitSelectController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    const authToken = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)
    const applicationId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_ID)
    const application = await Application.getById(authToken, applicationId)

    if (application.isSubmitted()) {
      return this.redirect(request, reply, Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
    }

    pageContext.formValues = request.payload

    pageContext.standardRules = await StandardRule.list(authToken)
    pageContext.permitCategoryRoute = Constants.Routes.PERMIT_CATEGORY.path

    return this.showView(request, reply, 'permitSelect', pageContext)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.details) {
      return this.doGet(request, reply, errors)
    } else {
      const authToken = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)
      const applicationId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_ID)
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

      return this.redirect(request, reply, Constants.Routes.TASK_LIST.path)
    }
  }
}
