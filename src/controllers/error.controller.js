'use strict'

const BaseController = require('./base.controller')

module.exports = class ErrorController extends BaseController {
  static async doGet (request, reply) {
    const context = {
      pageTitle: 'Waste Permits - Error'
    }
    return reply.view('error', context)
  }

  static async doPost (request, reply) {
    // Not supported
    console.error('Unable to POST to /error')
  }

  static handler (request, reply) {
    return BaseController.handler(request, reply, ErrorController, false)
  }
}
