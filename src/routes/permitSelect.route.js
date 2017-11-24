'use strict'

const Constants = require('../constants')
const PermitSelectController = require('../controllers/permitSelect.controller')
const PermitSelectValidator = require('../validators/permitSelect.validator')
const controller = new PermitSelectController(Constants.Routes.PERMIT_SELECT)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: 'The Select a permit page',
    handler: controller.handler,
    bind: controller,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}, {
  method: ['POST'],
  path: controller.path,
  config: {
    description: 'The POST Permit Select page',
    handler: controller.handler,
    bind: controller,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: PermitSelectValidator.getFormValidators(),
      failAction: controller.failAction
    }
  }
}]
