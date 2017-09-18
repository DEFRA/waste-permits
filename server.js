'use strict'

const Constants = require('./src/constants')
const config = require('./src/config/config')
const logConfig = require('./src/config/logConfig')

const fs = require('fs')
const Path = require('path')
const Hapi = require('hapi')
const HapiRouter = require('hapi-router')
const Blipp = require('blipp')
const Disinfect = require('disinfect')
const HapiAlive = require('hapi-alive')
const Good = require('good')
const HapiDevErrors = require('hapi-dev-errors')
const server = new Hapi.Server()

const loadHealthTemplate = () => {
  let template = String(fs.readFileSync((Path.join(__dirname, 'src', 'views', 'health.html'))))
  template = template
    .replace('##PAGE_TITLE##', Constants.buildPageTitle(Constants.Routes.HEALTH.pageHeading))
    .replace('##SERVICE_NAME##', Constants.SERVICE_NAME)
    .replace('##APP_VERSION##', Constants.getVersion())
    .replace('##GITHUB_HREF##', `${Constants.GITHUB_LOCATION}/commit/${config.gitSha}`)
    .replace('##GITHB_COMMIT_REF##', config.gitSha)
  return template
}

server.connection({
  port: config.port,
  routes: {
    validate: {
      options: {
        abortEarly: false
      }
    }
  }
})

// Create a session cookie in which to store a waste permit application token
server.state(Constants.COOKIE_KEY, {
  ttl: null,                // Session lifespan (deleted when browser closed)
  isSecure: true,           // Secure
  isHttpOnly: true,         // and non-secure
  isSameSite: 'Strict',     // Don't attach cookies on cross-site requests, preventing CSRF attacks
  encoding: 'base64json',   // Base 64 JSON encoded
  clearInvalid: false,      // Remove invalid cookies
  strictHeader: true        // Don't allow violations of RFC 6265
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
      path: Constants.Routes.HEALTH.path,
      responses: {
        healthy: {
          message: loadHealthTemplate()
        },
        unhealthy: {
          statusCode: 400
        }
      }
    }
  }, {
    // Plugin to return an error view for web request. Only used when the server is running in DEVELOPMENT mode.
    register: HapiDevErrors,
    options: {
      showErrors: config.nodeEnvironment === 'DEVELOPMENT'
    }
  }, {
    // Plugin for logging
    register: Good,
    options: logConfig.options
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

  server.log(Constants.LogLevel.INFO, 'Server running in environment: ' + config.nodeEnvironment)
  server.log(Constants.LogLevel.INFO, 'Server running at:' + JSON.stringify(server.info))
  server.log(Constants.LogLevel.INFO, `Service: ${Constants.SERVICE_NAME}`)
  server.log(Constants.LogLevel.INFO, `Version: ${Constants.getVersion()}`)
  server.log(Constants.LogLevel.INFO, `Latest commit: ${config.gitSha}`)
})

// Listen on SIGINT signal and gracefully stop the server
process.on('SIGINT', function () {
  server.log(Constants.LogLevel.ERROR, 'Stopping hapi server')

  server.stop({ timeout: 10000 }).then((err) => {
    server.log(Constants.LogLevel.ERROR, 'Hapi server stopped')
    process.exit((err) ? 1 : 0)
  })
})

module.exports = server
