'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')

module.exports = class SitePlanController extends BaseController {
  static async doGet (request, reply, errors) {
    try {
      const pageContext = BaseController.createPageContext(Constants.Routes.SITE_PLAN)
      return reply
        .view('sitePlan', pageContext)
    } catch (error) {
      request.log('ERROR', error)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  static async doPost (request, reply, errors) {
    // Not implemented yet
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, SitePlanController)
  }
}
