'use strict'

const Constants = require('../constants')
const CostTimeController = require('../controllers/costTime.controller')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.COST_TIME.path,
  config: {
    description: 'The Cost and time for this permit page',
    handler: CostTimeController.handler,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
