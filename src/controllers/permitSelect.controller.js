'use strict'

const Constants = require('../constants')
const LoggingService = require('../services/logging.service')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const StandardRule = require('../models/standardRule.model')
const PermitSelectValidator = require('../validators/permitSelect.validator')
const ApplicationLine = require('../models/applicationLine.model')

module.exports = class PermitSelectController extends BaseController {
  static async doGet (request, reply, errors) {
    try {
      const pageContext = BaseController.createPageContext(Constants.Routes.PERMIT_SELECT, errors, PermitSelectValidator)

      const authToken = CookieService.getAuthToken(request)

      pageContext.formValues = request.payload

      pageContext.standardRules = await StandardRule.list(authToken)
      pageContext.permitCategoryRoute = Constants.Routes.PERMIT_CATEGORY.path

      return reply
        .view('permitSelect', pageContext)
    } catch (error) {
      LoggingService.logError(error, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  static async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return PermitSelectController.doGet(request, reply, errors)
    } else {
      const authToken = CookieService.getAuthToken(request)
      const applicationId = CookieService.getApplicationId(request)
      try {
        // Look up the Standard Rule based on the chosen permit type
        const standardRule = await StandardRule.getByCode(authToken, request.payload['chosen-permit'])

        // Create a new Application Line in Dynamics and set the applicationLineId in the cookie
        const applicationLine = new ApplicationLine({
          applicationId: applicationId,
          standardRuleId: standardRule.id
        })

        await applicationLine.save(authToken)

        // Set the application ID in the cookie
        CookieService.setApplicationLineId(request, applicationLine.id)

        return reply.redirect(Constants.Routes.TASK_LIST.path)
      } catch (error) {
        LoggingService.logError(error)
        return reply.redirect(Constants.Routes.ERROR.path)
      }
    }
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, PermitSelectController)
  }
}
