'use strict'

const Constants = require('../constants')
const FirePreventionPlanController = require('../controllers/firePreventionPlan.controller')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.FIRE_PREVENTION_PLAN.path,
  config: {
    description: 'The Upload the fire prevention plan page',
    handler: FirePreventionPlanController.handler,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
