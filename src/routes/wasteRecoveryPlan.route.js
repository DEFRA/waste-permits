'use strict'

const Constants = require('../constants')
const WasteRecoveryPlanController = require('../controllers/wasteRecoveryPlan.controller')
const controller = new WasteRecoveryPlanController(Constants.Routes.WASTE_RECOVERY_PLAN)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: 'The Waste Recovery Plan page',
    handler: controller.handler,
    bind: controller,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
