'use strict'

const Constants = require('../constants')

module.exports = class BaseController {
  static handler (request, reply, errors, controllerSubclass, validateToken = true) {
    if (validateToken) {
      // Validate the session cookie
      let token = request.server.methods.validateToken(request.state[Constants.COOKIE_KEY])
      if (!token) {
        // Redirect off an error screen
        return reply.redirect(Constants.Routes.ERROR)
      }
    }
    if (request.method.toUpperCase() === 'GET') {
      return controllerSubclass.doGet(request, reply, errors)
    } else if (request.method.toUpperCase() === 'POST') {
      return controllerSubclass.doPost(request, reply, errors)
    }
  }
}
