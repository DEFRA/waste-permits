'use strict'

const Constants = require('../constants')
const ConfirmRulesController = require('../controllers/confirmRules.controller')
const controller = new ConfirmRulesController(Constants.Routes.CONFIRM_RULES)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: `The GET 'Confirm that your operation meets the rules page'`,
    handler: controller.handler,
    bind: controller
  }
}, {
  method: ['POST'],
  path: controller.path,
  config: {
    description: `The POST 'Confirm that your operation meets the rules page'`,
    handler: controller.handler,
    bind: controller
  }
}]
