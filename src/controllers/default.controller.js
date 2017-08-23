'use strict'

const Constants = require('../constants')

// TODO confirm which version of UUID to use
const uuid4 = require('uuid/v4')

const BaseController = require('./base.controller')
const ActiveDirectoryAuthService = require('../services/activeDirectoryAuth.service')
const authService = new ActiveDirectoryAuthService()

module.exports = class DefaultController extends BaseController {
  static async doGet (request, reply) {
    const context = {
      pageTitle: 'Waste Permits'
    }

    // TODO: Confirm when we are going to create the session cookie

    // if (!request.state.session.token) {
    //   // Generate a session token
    //   const token = uuid4()
    //   console.log('Generated session token: ' + token)
    //
    //   request.state.session.token = token
    // }
    // reply
    //   .view('index', context)
    //   .state('session', request.state.session)

    reply.view('index', context)
  }

  static async doPost (request, reply) {
    // Generate a session token
    const token = uuid4()
    console.log('Generated session token: ' + token)

    // Generate a CRM token
    const authToken = await authService.getToken()
    console.log('Generated CRM token:' + authToken)

    // TODO: Confirm how session handling will work and where the most appropriate point is to create
    // and destroy session cookies

    const cookie = {
      // token: request.state.session.token,
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
    return BaseController.handler(request, reply, DefaultController, false)
  }
}
