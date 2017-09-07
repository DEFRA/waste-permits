'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')

module.exports = class RootController extends BaseController {
  static async doGet (request, reply, errors) {
    const pageContext = BaseController.createPageContext(Constants.Routes.ROOT, errors)

    reply.view('index', pageContext)
  }

  static async doPost (request, reply, errors) {
    const cookie = await BaseController.generateCookie(reply)

    return reply
      .redirect(Constants.Routes.SITE.path)

      // Delete the existing session cookie
      .unstate(Constants.COOKIE_KEY)

      // Add the new cookie
      .state(Constants.COOKIE_KEY, cookie)
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, RootController, false)
  }
}
