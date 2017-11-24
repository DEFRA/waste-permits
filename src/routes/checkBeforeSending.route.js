'use strict'

const Constants = require('../constants')
const CheckBeforeSendingController = require('../controllers/checkBeforeSending.controller')
const controller = new CheckBeforeSendingController(Constants.Routes.CHECK_BEFORE_SENDING)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: 'The Check your answers before sending your application page',
    handler: controller.handler,
    bind: controller,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
