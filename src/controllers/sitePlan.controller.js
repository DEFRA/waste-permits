'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const LoggingService = require('../services/logging.service')

module.exports = class SitePlanController extends BaseController {
  async doGet (request, reply) {
    try {
      const pageContext = this.createPageContext()
      return reply
        .view('sitePlan', pageContext)
    } catch (error) {
      LoggingService.logError(error, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  async doPost (request, reply, errors) {
    // Not implemented yet
  }
}
