'use strict'

const Constants = require('../constants')
const DrainageTypeDrainController = require('../controllers/drainageTypeDrain.controller')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.DRAINAGE_TYPE_DRAIN.path,
  config: {
    description: 'The Where does the vehicle storage area drain to? page',
    handler: DrainageTypeDrainController.handler,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
