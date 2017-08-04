const Hapi = require('hapi')
const server = new Hapi.Server()

server.connection({
  port: 8000
})

// Create a session cookie in which to store a waste permit application token
server.state('session', {
  ttl: null,                // Session lifespan (deleted when browser closed)
  isSecure: true,           // Secure
  isHttpOnly: true,         // and non-secure
  encoding: 'base64json',   // Base 64 JSON encoded
  clearInvalid: false,      // remove invalid cookies
  strictHeader: true        // Don't allow violations of RFC 6265
})

server.method('validateToken', (cookie) => {
  let token
  if (cookie && cookie.token) {
    token = cookie.token
    console.log('Validate token: ' + token)
    // TODO - Call persistence layer to validate the token
    // e.g.
    // token = dynamics.validateToken(token)
  }
  console.log('validate token result: ' + token)
  return token
})

server.register([
  require('inert'),
  require('vision'),
  {
    register: require('disinfect'),
    options: {
      disinfectQuery: true,
      disinfectParams: true,
      disinfectPayload: true
    }
  }],
  (err) => {
    if (err) {
      throw err
    }

    // Load views
    server.views(require('./src/views'))

    // TODO load in routes using wildcard
    // Load routes
    server.route(require('./src/routes/public'))
    server.route(require('./src/routes/default'))
    server.route(require('./src/routes/error'))
    server.route(require('./src/routes/taskList'))
    server.route(require('./src/routes/site'))
  })

// Start the server
server.start((err) => {
  if (err) {
    throw err
  }
  console.info('Server running at:', server.info)
})

module.exports = server
