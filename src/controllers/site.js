module.exports = function (request, reply) {
  const context = {
    pageTitle: 'Waste Permits - Site',
    message: 'Hello, World!'
  }

  let token = request.server.methods.validateToken(request.state.session)
  if (!token) {
    // Redirect off an error screen
    return reply.redirect('/error')
  }

  if (request.method === 'post') {
    // TODO validate post data using Joi
    let valid = true

    context.siteName = request.payload.siteName

    valid = (request.payload.siteName !== 'test')

    // TODO if the data is valid then persist it
    if (valid) {
      console.log('Incoming data: ' + request.payload.siteName)

      return reply.redirect('/task-list')
    } else {
      context.errors = {
        message: 'Invalid site name: [' + request.payload.siteName + ']'
      }
    }
  }

  return reply
    .view('site', context)
    .state('session', { token: token })
}
