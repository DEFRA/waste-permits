'use strict'

const Constants = require('../constants')
const PreApplicationController = require('../controllers/preApplication.controller')
const controller = new PreApplicationController(Constants.Routes.PRE_APPLICATION)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: 'The Have you discussed this application with us? page',
    handler: controller.handler,
    bind: controller,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
