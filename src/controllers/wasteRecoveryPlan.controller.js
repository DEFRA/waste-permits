'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const LoggingService = require('../services/logging.service')

module.exports = class WasteRecoveryPlanController extends BaseController {
  static async doGet (request, reply, errors) {
    try {
      const pageContext = BaseController.createPageContext(Constants.Routes.WASTE_RECOVERY_PLAN)
      return reply
        .view('wasteRecoveryPlan', pageContext)
    } catch (error) {
      LoggingService.logError(error, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  static async doPost (request, reply, errors) {
    // Not implemented yet
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, WasteRecoveryPlanController)
  }
}
