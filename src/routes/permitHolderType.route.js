'use strict'

const Constants = require('../constants')
const PermitHolderTypeController = require('../controllers/permitHolderType.controller')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.PERMIT_HOLDER_TYPE.path,
  config: {
    description: 'The Who will be the permit holder? page',
    handler: PermitHolderTypeController.handler,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
