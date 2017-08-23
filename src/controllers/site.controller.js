'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')

module.exports = class SiteController extends BaseController {
  static async doGet (request, reply, errors = undefined) {
    try {
      const context = {
        pageTitle: 'Waste Permits - Site',
        message: 'Hello, World!',
        errors: errors
      }
      return reply
        .view('site', context)
        .state(Constants.COOKIE_KEY, request.state[Constants.COOKIE_KEY])
    } catch (error) {
      console.error(error)
      return reply.redirect('/error')
    }
  }

  static async doPost (request, reply) {
    // TODO validate post data using Joi?
    let valid = (request.payload.siteName !== 'invalid_site_name')

    if (valid) {
      // console.log('Incoming data: ' + request.payload.siteName)

      // TODO if the data is valid then persist it here

      return reply
        .redirect('/contact')
        .state(Constants.COOKIE_KEY, request.state[Constants.COOKIE_KEY])
    } else {
      // Handle the validation error
      const errors = {
        message: 'Invalid site name: [' + request.payload.siteName + ']'
      }
      return SiteController.doGet(request, reply, errors)
    }
  }

  static handler (request, reply) {
    return BaseController.handler(request, reply, SiteController)
  }
}
