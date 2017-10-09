'use strict'

const Constants = require('./src/constants')
const config = require('./src/config/config')
const logConfig = require('./src/config/logConfig')
const cookieConfig = require('./src/config/cookieConfig')
const crumbConfig = require('./src/config/crumbConfig')
const LoggingService = require('./src/services/logging.service')

const fs = require('fs')
const Path = require('path')
const Hapi = require('hapi')
const HapiRouter = require('hapi-router')
const Blipp = require('blipp')
const Disinfect = require('disinfect')
const HapiAlive = require('hapi-alive')
const Good = require('good')
const HapiDevErrors = require('hapi-dev-errors')
const Crumb = require('crumb')
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
server.state(Constants.COOKIE_KEY, cookieConfig.options)

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
  }, {
    // Plugin for CSRF tokens
    register: Crumb,
    options: crumbConfig.options
  }], (err) => {
  if (err) {
    throw err
  }

    // Load views
  server.views(require('./src/views'))
})

server.ext('onPreResponse', (request, reply) => {
  // if the response is a Boom error object and the status code is 404
  if (request.response.isBoom && request.response.output.statusCode === 404) {
    // Redirect to the 404 page
    return reply.redirect(Constants.Routes.PAGE_NOT_FOUND.path)
  } else {
    return reply.continue()
  }
})

// Start the server
server.start((err) => {
  if (err) {
    throw err
  }

  LoggingService.logInfo(`Server running in environment: ${config.nodeEnvironment}`)
  LoggingService.logInfo(`Server running at: ${JSON.stringify(server.info)}`)
  LoggingService.logInfo(`Service: ${Constants.SERVICE_NAME}`)
  LoggingService.logInfo(`Version: ${Constants.getVersion()}`)
  LoggingService.logInfo(`Latest commit: ${config.gitSha}`)
})

// Listen on SIGINT signal and gracefully stop the server
process.on('SIGINT', () => {
  LoggingService.logInfo('Stopping hapi server')

  server.stop({ timeout: 10000 }).then((err) => {
    console.log('Hapi server stopped')
    process.exit((err) ? 1 : 0)
  })
})

module.exports = server
