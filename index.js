const Hapi = require('hapi')
const HapiRouter = require('hapi-router')
const Blipp = require('blipp')
const Disinfect = require('disinfect')
const HapiAlive = require('hapi-alive')
const HapiDevErrors = require('hapi-dev-errors')
const server = new Hapi.Server()

const environment = process.env.NODE_ENV

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
  console.log('Cookie: ' + cookie)
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
    // Plugin to automatically load the routes
    register: HapiRouter,
    options: {
      routes: './src/routes/*.js'
    }
  }, {
    // Plugin to display the routes table to console at startup
    register: Blipp,
    options: {}
  }, {
    // Plugin to prevent CSS attack by applying Google's Caja HTML Sanitizer on route query, payload, and params
    register: Disinfect,
    options: {
      disinfectQuery: true,
      disinfectParams: true,
      disinfectPayload: true
    }
  }, {
    // Plugin providing a health route for the server
    register: HapiAlive,
    options: {
      path: '/health',
      healthCheck: function (server, callback) {
            // TODO: Here you should preform your health checks
            // If something went wrong provide the callback with an error
        callback()
      }
    }
  }, {
    // Plugin to return an error view for web request. Only used in development
    register: HapiDevErrors,
    options: {
      showErrors: environment === 'development'
    }
  }], (err) => {
  if (err) {
    throw err
  }

  // Load views
  server.views(require('./src/views'))
})

// Start the server
server.start((err) => {
  if (err) {
    throw err
  }
  if (environment) {
    console.info('Server running in environment: [' + environment + ']')
  }
  console.info('Server running at:', server.info)
})

module.exports = server
