'use strict'

const Constants = require('../constants')
const LoggingService = require('../services/logging.service')
const BaseController = require('./base.controller')

module.exports = class PermitHolderTypeController extends BaseController {
  static async doGet (request, reply, errors) {
    try {
      const pageContext = BaseController.createPageContext(Constants.Routes.PERMIT_HOLDER_TYPE)
      return reply
        .view('permitHolderType', pageContext)
    } catch (error) {
      LoggingService.logError(error, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  static async doPost (request, reply, errors) {
    // Not implemented yet
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, PermitHolderTypeController)
  }
}
