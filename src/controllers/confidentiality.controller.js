'use strict'

const BaseController = require('./base.controller')

module.exports = class ConfidentialityController extends BaseController {
  async doGet (request, reply) {
    const pageContext = this.createPageContext()
    return reply
      .view('confidentiality', pageContext)
  }

  async doPost (request, reply, errors) {
    // Not implemented yet
  }
}
