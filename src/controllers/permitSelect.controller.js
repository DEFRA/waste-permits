'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const StandardRule = require('../models/standardRule.model')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
const PermitSelectValidator = require('../validators/permitSelect.validator')

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
      // TODO persist the chosen permit to Dynamics using the applicationId and authToken from the cookie
      // const chosenPermit = request.payload['chosen-permit']
      // Dynamics.setPermit(applicationId, chosenPermit)

      return reply.redirect(Constants.Routes.TASK_LIST.path)
    }
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, PermitSelectController)
  }
}
