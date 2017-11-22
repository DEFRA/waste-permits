'use strict'

const Constants = require('../constants')
const PermitHolderTypeController = require('../controllers/permitHolderType.controller')
const controller = new PermitHolderTypeController(Constants.Routes.PERMIT_HOLDER_TYPE)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: 'The Who will be the permit holder? page',
    handler: controller.handler,
    bind: controller,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
