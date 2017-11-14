'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
const ConfirmRules = require('../models/confirmRules.model')

module.exports = class ConfirmRulesController extends BaseController {
  static async isComplete (request) {
    const authToken = CookieService.getAuthToken(request)
    const applicationId = CookieService.getApplicationId(request)
    const applicationLineId = CookieService.getApplicationLineId(request)
    const {complete} = (await ConfirmRules.getByApplicationId(authToken, applicationId, applicationLineId))
    return complete
  }

  static async doGet (request, reply, errors) {
    try {
      const pageContext = BaseController.createPageContext(Constants.Routes.CONFIRM_RULES, errors)

      pageContext.complete = await this.isComplete(request)
      return reply
        .view('confirmRules', pageContext)
    } catch (error) {
      LoggingService.logError(error, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  static async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return ConfirmRulesController.doGet(request, reply, errors)
    } else {
      const authToken = CookieService.getAuthToken(request)
      try {
        const applicationLineId = CookieService.getApplicationLineId(request)

        const complete = await this.isComplete(request)
        if (complete) {
          return reply.redirect(Constants.Routes.TASK_LIST.path)
        }

        const confirmRules = new ConfirmRules({
          applicationLineId: applicationLineId
        })

        await confirmRules.save(authToken)
        return reply.redirect(Constants.Routes.CONFIRM_RULES.path)
      } catch (error) {
        LoggingService.logError(error, request)
        return reply.redirect(Constants.Routes.ERROR.path)
      }
    }
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, ConfirmRulesController)
  }
}
