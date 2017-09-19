'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const StandardRule = require('../models/standardRule.model')
const LoggingService = require('../services/logging.service')
const PermitSelectValidator = require('../validators/permitSelect.validator')

module.exports = class PermitSelectController extends BaseController {
  static async doGet (request, reply, errors) {
    try {
      const pageContext = BaseController.createPageContext(Constants.Routes.PERMIT_SELECT, errors, PermitSelectValidator)

      let authToken
      if (request.state[Constants.COOKIE_KEY]) {
        authToken = request.state[Constants.COOKIE_KEY].authToken
      }

      pageContext.formValues = request.payload

      pageContext.standardRules = await StandardRule.list(authToken)

      pageContext.dinner = 'elbow macaroni'

      console.log(pageContext.standardRules)

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
      // TODO persist the data here if required
      // const applicationId = request.state[Constants.COOKIE_KEY].applicationId

      return reply.redirect(Constants.Routes.TASK_LIST.path)
    }
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, PermitSelectController)
  }
}
