'use strict'

const Constants = require('../constants')
const DrainageTypeDrainController = require('../controllers/drainageTypeDrain.controller')
const controller = new DrainageTypeDrainController(Constants.Routes.DRAINAGE_TYPE_DRAIN)

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.DRAINAGE_TYPE_DRAIN.path,
  config: {
    description: 'The Where does the vehicle storage area drain to? page',
    handler: controller.handler,
    bind: controller,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
