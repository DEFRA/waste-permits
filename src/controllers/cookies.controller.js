'use strict'

const BaseController = require('./base.controller')

module.exports = class CookiesController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    return reply
      .view('cookies', pageContext)
  }

  async doPost (request, reply, errors) {
    // Not implemented yet
    return this.doGet(request, reply, errors)
  }
}
