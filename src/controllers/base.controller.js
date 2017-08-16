'use strict'

module.exports = class BaseController {
  static handler (request, reply, controllerSubclass, validateToken = true) {
    if (validateToken) {
      // Validate the session cookie
      let token = request.server.methods.validateToken(request.state.session)
      if (!token) {
        // Redirect off an error screen
        return reply.redirect('/error')
      }
    }
    if (request.method === 'get') {
      return controllerSubclass.doGet(request, reply)
    } else if (request.method === 'post') {
      return controllerSubclass.doPost(request, reply)
    }
  }
}
