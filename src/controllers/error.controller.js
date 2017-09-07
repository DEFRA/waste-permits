'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')

module.exports = class ErrorController extends BaseController {
  static async doGet (request, reply, errors) {
    const pageContext = BaseController.createPageContext(Constants.Routes.ERROR.pageHeading, errors)
    return reply.view('error', pageContext)
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, ErrorController, false)
  }
}
