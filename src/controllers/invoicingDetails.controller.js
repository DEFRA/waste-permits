'use strict'

const BaseController = require('./base.controller')

module.exports = class InvoicingDetailsController extends BaseController {
  async doGet (request, reply) {
    const pageContext = this.createPageContext()
    return reply
      .view('invoicingDetails', pageContext)
  }

  async doPost (request, reply, errors) {
    // Not implemented yet
  }
}
