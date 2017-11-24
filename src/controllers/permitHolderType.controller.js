'use strict'

const Constants = require('../constants')
const LoggingService = require('../services/logging.service')
const BaseController = require('./base.controller')

module.exports = class PermitHolderTypeController extends BaseController {
  async doGet (request, reply) {
    try {
      const pageContext = this.createPageContext()
      return reply
        .view('permitHolderType', pageContext)
    } catch (error) {
      LoggingService.logError(error, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  async doPost (request, reply, errors) {
    // Not implemented yet
  }
}
