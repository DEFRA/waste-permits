'use strict'

const Constants = require('../constants')
const CheckBeforeSendingController = require('../controllers/checkBeforeSending.controller')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.CHECK_BEFORE_SENDING.path,
  config: {
    description: 'The Check your answers before sending your application page',
    handler: CheckBeforeSendingController.handler,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
