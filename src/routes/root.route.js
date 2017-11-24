'use strict'

const Constants = require('../constants')
const RootController = require('../controllers/root.controller')
const controller = new RootController(Constants.Routes.ROOT)

module.exports = [{
  method: ['GET', 'POST'],
  path: controller.path,
  config: {
    description: 'The home page',
    handler: controller.handler,
    bind: controller
  }
}]
