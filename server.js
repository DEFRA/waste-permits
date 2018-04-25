'use strict'

const Constants = require('./src/constants')
const config = require('./src/config/config')
const logConfig = require('./src/config/logConfig')
const cookieConfig = require('./src/config/cookieConfig')
const crumbConfig = require('./src/config/crumbConfig')
const LoggingService = require('./src/services/logging.service')
const PollingService = require('./src/services/polling.service')

const fs = require('fs')
const Path = require('path')
const Hapi = require('hapi')
const Inert = require('inert')
const Vision = require('vision')
const HapiRouter = require('hapi-router')
const HapiRobots = require('hapi-robots')
const Blipp = require('blipp')
const Disinfect = require('disinfect')
const SanitizePayload = require('hapi-sanitize-payload')
const HapiAlive = require('hapi-alive')
const Good = require('good')
const HapiDevErrors = require('hapi-dev-errors')
const Crumb = require('crumb')

let serverOptions = {
  port: config.port,
  routes: {
    validate: {
      options: {
        abortEarly: false
      }
    }
  }
}

if (config.LOG_LEVEL === Constants.LogLevels.DEBUG) {
  // Start the server in DEBUG mode
  serverOptions.debug = {
    log: ['error']
  }
}

const loadHealthTemplate = () => {
  let template = String(fs.readFileSync((Path.join(__dirname, 'src', 'views', 'health.html'))))
  template = template
    .replace('##PAGE_TITLE##', Constants.buildPageTitle(Constants.Routes.HEALTH.pageHeading))
    .replace('##SERVICE_NAME##', Constants.SERVICE_NAME)
    .replace('##APP_VERSION##', Constants.getVersion())
    .replace('##GITHUB_HREF##', `${Constants.GITHUB_LOCATION}/commit/${config.gitSha}`)
    .replace('##GITHB_COMMIT_REF##', config.gitSha)
    .replace('##APP_PATH##', fs.realpathSync(__dirname))
  return template
}

const server = new Hapi.Server(serverOptions)

// Create a session cookie in which to store a waste permit application token
server.state(Constants.DEFRA_COOKIE_KEY, cookieConfig.options)

const registerPlugins = async () => server.register([
  // Static file and directory handlers plugin for hapi.js
  // See https://www.npmjs.com/package/inert
  {
    plugin: Inert
  },

  // Templates rendering plugin support for hapi.js
  // See https://www.npmjs.com/package/vision
  {
    plugin: Vision
  },

  // Plugin to automatically load the routes based on their file location
  // See https://www.npmjs.com/package/hapi-router
  {
    plugin: HapiRouter,
    options: {
      routes: './src/routes/**/*.route.js'
    }
  },

  // Plugin for serving up robots.txt
  // See https://www.npmjs.com/package/hapi-robots
  {
    plugin: HapiRobots,
    options: {
      // will disallow everyone from every path:
      '*': ['/']
    }
  },

  // Plugin to display the routes table to console at startup
  // See https://www.npmjs.com/package/blipp
  {
    plugin: Blipp,
    options: {}
  },

  // Plugin to prevent CSS attack by applying Google's Caja HTML Sanitizer on route query, payload, and params
  // See https://www.npmjs.com/package/disinfect
  {
    plugin: Disinfect,
    options: {
      deleteEmpty: true,
      deleteWhitespace: true,
      disinfectQuery: true,
      disinfectParams: true,
      disinfectPayload: true
    }
  },

  // Plugin to recursively sanitize or prune values in a request.payload object
  // See https://www.npmjs.com/package/hapi-sanitize-payload
  {
    plugin: SanitizePayload,
    options: {
      pruneMethod: 'delete'
    }
  },

  // Plugin providing a health route for the server
  // See https://www.npmjs.com/package/hapi-alive
  {
    plugin: HapiAlive,
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
  },

  // Plugin to return an error view for web request. Only used when the server is running in DEVELOPMENT mode.
  // See https://www.npmjs.com/package/hapi-dev-errors
  {
    plugin: HapiDevErrors,
    options: {
      showErrors: config.nodeEnvironment === 'DEVELOPMENT'
    }
  },

  // Plugin for logging
  // See https://www.npmjs.com/package/good
  {
    plugin: Good,
    options: logConfig.options
  },

  // Plugin for CSRF tokens
  // See https://www.npmjs.com/package/crumb
  {
    plugin: Crumb,
    options: crumbConfig.options
  }
])

const start = async () => {
  // Load views
  server.views(require('./src/views'))

  server.ext('onPreResponse', (request, h) => {
    const response = request.response

    // if the response is a Boom error object and the status code is 404
    if (response.isBoom && response.output.statusCode === 404) {
      return h.redirect(Constants.Routes.ERROR.PAGE_NOT_FOUND.path)
    } else if (response.isBoom && response.output.statusCode === 403) {
      return h.redirect(Constants.Routes.ERROR.COOKIES_DISABLED.path)
    } else {
      return h.continue
    }
  })

  // Start the server
  await server.start()
  LoggingService.logInfo(`Server running in environment: ${config.nodeEnvironment}`)
  LoggingService.logInfo(`Server running at: ${JSON.stringify(server.info)}`)
  LoggingService.logInfo(`Service: ${Constants.SERVICE_NAME}`)
  LoggingService.logInfo(`Version: ${Constants.getVersion()}`)
  LoggingService.logInfo(`Latest commit: ${config.gitSha}`)
  LoggingService.logInfo(`Log level: ${config.LOG_LEVEL}`)

  // Listen on SIGINT signal and gracefully stop the server
  process.on('SIGINT', async () => {
    LoggingService.logInfo('Stopping hapi server')
    let state = 0
    try {
      PollingService.stop()
      await server.stop()
    } catch (err) {
      state = 1
    }
    console.log('Hapi server stopped')
    process.exit(state)
  })

  // Start polling the CRM to keep it awake
  PollingService.start(config.dynamicsPollingInterval)
}

registerPlugins().then(start)

module.exports = server
