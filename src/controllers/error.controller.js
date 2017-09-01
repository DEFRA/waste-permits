'use strict'

const BaseController = require('./base.controller')

module.exports = class ErrorController extends BaseController {
  static async doGet (request, reply, errors) {
    const pageContext = BaseController.createPageContext('Something went wrong', errors)

    return reply.view('error', pageContext)
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, ErrorController, false)
  }
}
