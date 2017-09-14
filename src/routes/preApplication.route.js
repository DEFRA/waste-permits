'use strict'

const Constants = require('../constants')
const PreApplicationController = require('../controllers/preApplication.controller')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.PRE_APPLICATION.path,
  config: {
    description: 'The Have you discussed this application with us? page',
    handler: PreApplicationController.handler,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
