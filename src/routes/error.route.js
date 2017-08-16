'use strict'

const ErrorController = require('../controllers/error.controller')

module.exports = [{
  method: 'GET',
  path: '/error',
  config: {
    description: 'The error page',
    handler: ErrorController.handler
  }
}]
