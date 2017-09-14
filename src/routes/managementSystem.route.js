'use strict'

const Constants = require('../constants')
const ManagementSystemController = require('../controllers/managementSystem.controller')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.MANAGEMENT_SYSTEM.path,
  config: {
    description: 'The Which management system will you use? page',
    handler: ManagementSystemController.handler,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
