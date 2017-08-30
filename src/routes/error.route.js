'use strict'

const Constants = require('../constants')
const ErrorController = require('../controllers/error.controller')

module.exports = [{
  method: 'GET',
  path: Constants.Routes.ERROR,
  config: {
    description: 'The error page',
    handler: ErrorController.handler
  }
}]
