'use strict'

const BaseController = require('./base.controller')

module.exports = class SitePlanController extends BaseController {
  async doGet (request, reply) {
    const pageContext = this.createPageContext()
    return reply
      .view('sitePlan', pageContext)
  }

  async doPost (request, reply, errors) {
    // Not implemented yet
  }
}
