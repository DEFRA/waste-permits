'use strict'

const BaseController = require('./base.controller')

module.exports = class ErrorController extends BaseController {
  static async doGet (request, reply) {
    const context = {
      pageTitle: 'Waste Permits - Error'
    }
    return reply.view('error', context)
  }

  static handler (request, reply) {
    return BaseController.handler(request, reply, ErrorController, false)
  }
}
