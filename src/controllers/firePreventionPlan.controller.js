'use strict'

const BaseController = require('./base.controller')

module.exports = class FirePreventionPlanController extends BaseController {
  async doGet (request, reply) {
    const pageContext = this.createPageContext()
    return reply
      .view('firePreventionPlan', pageContext)
  }

  async doPost (request, reply, errors) {
    // Not implemented yet
  }
}
