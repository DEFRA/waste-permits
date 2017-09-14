'use strict'

const Constants = require('../constants')
const PermitSelectController = require('../controllers/permitSelect.controller')
const PermitSelectValidator = require('../validators/permitSelect.validator')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.PERMIT_SELECT.path,
  config: {
    description: 'The Select a permit page',
    handler: PermitSelectController.handler,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}, {
  method: ['POST'],
  path: Constants.Routes.PERMIT_SELECT.path,
  config: {
    description: 'The POST Permit Select page',
    handler: PermitSelectController.handler,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: PermitSelectValidator.getFormValidators(),
      failAction: PermitSelectController.handler
    }
  }
}]
