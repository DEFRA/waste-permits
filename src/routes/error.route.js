'use strict'

const Constants = require('../constants')
const ErrorController = require('../controllers/error.controller')
const controller = new ErrorController(Constants.Routes.ERROR, false)

module.exports = [{
  method: 'GET',
  path: controller.path,
  config: {
    description: 'The error page',
    handler: controller.handler,
    bind: controller
  }
}]
