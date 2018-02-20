'use strict'

const BaseController = require('./base.controller')

module.exports = class CheckYourEmailController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)

    pageContext.formValues = request.payload
    return reply.view('checkYourEmail', pageContext)
  }

  async doPost (request, reply, errors) {
    // Not implemented yet
    return this.doGet(request, reply, errors)
  }
}
