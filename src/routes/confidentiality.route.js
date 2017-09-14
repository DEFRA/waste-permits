'use strict'

const Constants = require('../constants')
const ConfidentialityController = require('../controllers/confidentiality.controller')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.CONFIDENTIALITY.path,
  config: {
    description: 'The Is part of your application commercially confidential? page',
    handler: ConfidentialityController.handler,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
