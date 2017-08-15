'use strict'

module.exports = function (request, reply) {
  const context = {
    pageTitle: 'Waste Permits - Site',
    message: 'Hello, World!'
  }

  // Validate the session cookie
  let token = request.server.methods.validateToken(request.state.session)
  if (!token) {
    // Redirect off an error screen
    return reply.redirect('/error')
  }
  const doGet = (request, reply) => {
    return reply
      .view('site', context)
      .state('session', request.state.session)
  }

  const doPost = (request, reply) => {
    // TODO validate post data using Joi
    let valid = true

    context.siteName = request.payload.siteName

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
    }
  }

  if (request.method === 'get') {
    doGet(request, reply)
  } else if (request.method === 'post') {
    doPost(request, reply)
  }
}
