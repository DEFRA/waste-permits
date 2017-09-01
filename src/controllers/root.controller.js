'use strict'

const Constants = require('../constants')

// Used for generating a session id which is saved as a cookie
const uuid4 = require('uuid/v4')

const BaseController = require('./base.controller')
const ActiveDirectoryAuthService = require('../services/activeDirectoryAuth.service')
const authService = new ActiveDirectoryAuthService()

module.exports = class RootController extends BaseController {
  static async doGet (request, reply, errors) {
    const pageContext = BaseController.createPageContext('Waste Permits Home Page', errors)

    reply.view('index', pageContext)
  }

  static async doPost (request, reply, errors) {
    // Generate a session token
    const token = uuid4()
    console.log('Generated session token: ' + token)

    // Generate a CRM token
    const authToken = await authService.getToken()
    console.log('Generated CRM token:' + authToken)

    // TODO: Confirm how session handling will work and where the most
    // appropriate point is to create and destroy session cookies

    const cookie = {
      token: token,
      authToken: authToken
    }

    return reply
      .redirect(Constants.Routes.SITE)

      // Delete the existing session cookie
      .unstate(Constants.COOKIE_KEY)

      // Add the new cookie
      .state(Constants.COOKIE_KEY, cookie)
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, RootController, false)
  }
}
