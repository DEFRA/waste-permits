'use strict'

const Constants = require('../constants')
const WasteRecoveryPlanController = require('../controllers/wasteRecoveryPlan.controller')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.WASTE_RECOVERY_PLAN.path,
  config: {
    description: 'The Waste Recovery Plan page',
    handler: WasteRecoveryPlanController.handler,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
