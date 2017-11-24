'use strict'

const Constants = require('../constants')
const FirePreventionPlanController = require('../controllers/firePreventionPlan.controller')
const controller = new FirePreventionPlanController(Constants.Routes.FIRE_PREVENTION_PLAN)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: 'The Upload the fire prevention plan page',
    handler: controller.handler,
    bind: controller,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
