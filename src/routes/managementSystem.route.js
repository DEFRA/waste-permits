'use strict'

const Constants = require('../constants')
const ManagementSystemController = require('../controllers/managementSystem.controller')
const controller = new ManagementSystemController(Constants.Routes.MANAGEMENT_SYSTEM)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: 'The Which management system will you use? page',
    handler: controller.handler,
    bind: controller,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
