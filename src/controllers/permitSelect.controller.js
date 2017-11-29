'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const StandardRule = require('../models/standardRule.model')
const PermitSelectValidator = require('../validators/permitSelect.validator')
const ApplicationLine = require('../models/applicationLine.model')

module.exports = class PermitSelectController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors, PermitSelectValidator)
    const authToken = CookieService.getAuthToken(request)

    pageContext.formValues = request.payload

    pageContext.standardRules = await StandardRule.list(authToken)
    pageContext.permitCategoryRoute = Constants.Routes.PERMIT_CATEGORY.path

    return reply
      .view('permitSelect', pageContext)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      const authToken = CookieService.getAuthToken(request)
      const applicationId = CookieService.getApplicationId(request)
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
      CookieService.setApplicationLineId(request, applicationLine.id)

      return reply.redirect(Constants.Routes.TASK_LIST.path)

      // Add the updated cookie
        .state(Constants.COOKIE_KEY, request.state[Constants.COOKIE_KEY], Constants.COOKIE_PATH)
    }
  }
}
