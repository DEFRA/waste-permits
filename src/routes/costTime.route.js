'use strict'

const Constants = require('../constants')
const CostTimeController = require('../controllers/costTime.controller')
const controller = new CostTimeController(Constants.Routes.COST_TIME)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: 'The Cost and time for this permit page',
    handler: controller.handler,
    bind: controller,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
