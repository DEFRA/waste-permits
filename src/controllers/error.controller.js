'use strict'

const BaseController = require('./base.controller')

module.exports = class ErrorController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    return reply.view('error', pageContext)
  }

  handler (request, reply, source, errors) {
    return super.handler(request, reply, source, errors, false)
  }
}
