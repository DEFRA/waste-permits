'use strict'

const BaseController = require('./base.controller')

module.exports = class CheckBeforeSendingController extends BaseController {
  async doGet (request, reply) {
    const pageContext = this.createPageContext()
    return reply
      .view('checkBeforeSending', pageContext)
  }

  async doPost (request, reply, errors) {
    // Not implemented yet
  }
}
