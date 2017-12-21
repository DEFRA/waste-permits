'use strict'

const Constants = require('../constants')
const VersionController = require('../controllers/version.controller')
const controller = new VersionController(Constants.Routes.VERSION, false)

module.exports = [{
  method: 'GET',
  path: controller.path,
  config: {
    description: 'The version page',
    handler: controller.handler,
    bind: controller
  }
}]
