'use strict'

const BaseController = require('./base.controller')

module.exports = class SiteController extends BaseController {
  static async doGet (request, reply) {
    try {
      const context = {
        pageTitle: 'Waste Permits - Site',
        message: 'Hello, World!'
      }
      return reply
        .view('site', context)
        .state('session', request.state.session)
    } catch (error) {
      console.error(error)
      return reply.redirect('/error')
    }
  }

  static async doPost (request, reply) {
    // TODO validate post data using Joi
    let valid = true

    const context = {
      siteName: request.payload.siteName
    }

    valid = (request.payload.siteName !== 'invalid_site_name')

    // TODO if the data is valid then persist it
    if (valid) {
      console.log('Incoming data: ' + request.payload.siteName)

      return reply
        .redirect('/contact')
        .state('session', request.state.session)
    } else {
      context.errors = {
        message: 'Invalid site name: [' + request.payload.siteName + ']'
      }
      // TODO error handling
    }
  }

  static handler (request, reply) {
    return BaseController.handler(request, reply, SiteController)
  }
}
