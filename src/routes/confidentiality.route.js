'use strict'

const Constants = require('../constants')
const ConfidentialityController = require('../controllers/confidentiality.controller')
const controller = new ConfidentialityController(Constants.Routes.CONFIDENTIALITY)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: 'The Is part of your application commercially confidential? page',
    handler: controller.handler,
    bind: controller,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
