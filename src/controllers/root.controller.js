'use strict'

const Constants = require('../constants')

// Used for generating a session id which is saved as a cookie
const uuid4 = require('uuid/v4')

const BaseController = require('./base.controller')
const ActiveDirectoryAuthService = require('../services/activeDirectoryAuth.service')
const authService = new ActiveDirectoryAuthService()

module.exports = class RootController extends BaseController {
  static async doGet (request, reply) {
    const context = {
      pageTitle: 'Waste Permits'
    }

    reply.view('index', context)
  }

  static async doPost (request, reply) {
    // Generate a session token
    const token = uuid4()

    // Generate a CRM token
    const authToken = await authService.getToken()

    // TODO: Confirm how session handling will work and where the most
    // appropriate point is to create and destroy session cookies

    const cookie = {
      token: token,
      authToken: authToken
    }

    return reply
      .redirect('/site')

      // Delete the existing session cookie
      .unstate(Constants.COOKIE_KEY)

      // Add the new cookie
      .state(Constants.COOKIE_KEY, cookie)
  }

  static handler (request, reply) {
    return BaseController.handler(request, reply, RootController, false)
  }
}
