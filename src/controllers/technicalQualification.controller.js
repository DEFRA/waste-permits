'use strict'

const BaseController = require('./base.controller')

module.exports = class TechnicalQualificationController extends BaseController {
  async doGet (request, reply) {
    const pageContext = this.createPageContext()
    return reply
      .view('technicalQualification', pageContext)
  }

  async doPost (request, reply, errors) {
    // Not implemented yet
  }
}
