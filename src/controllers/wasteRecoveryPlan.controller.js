'use strict'

const BaseController = require('./base.controller')

module.exports = class WasteRecoveryPlanController extends BaseController {
  async doGet (request, reply) {
    const pageContext = this.createPageContext()
    return reply
      .view('wasteRecoveryPlan', pageContext)
  }

  async doPost (request, reply, errors) {
    // Not implemented yet
  }
}
