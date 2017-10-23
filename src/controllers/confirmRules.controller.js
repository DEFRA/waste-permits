'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
const ConfirmRules = require('../models/confirmRules.model')

module.exports = class ConfirmRulesController extends BaseController {
  static async doGet (request, reply, errors) {
    try {
      const pageContext = BaseController.createPageContext(Constants.Routes.CONFIRM_RULES, errors)

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
      const applicationLineId = CookieService.getApplicationLineId(request)

      // Get the Site for this application (if we have one)
      const confirmRules = new ConfirmRules({
        applicationLineId: applicationLineId
      })

      try {
        await confirmRules.save(authToken)
        return reply.redirect(Constants.Routes.TASK_LIST.path)

        // TODO go back to Task list on 2nd post
        // return reply.redirect(Constants.Routes.CONFIRM_RULES.path)
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
