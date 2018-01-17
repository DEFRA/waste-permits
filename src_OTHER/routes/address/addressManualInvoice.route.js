'use strict'

const Constants = require('../../constants')
const AddressManualController = require('../../controllers/address/addressManual.controller')
const AddressManualValidator = require('../../validators/address/addressManual.validator')
const controller = new AddressManualController(Constants.Routes.ADDRESS.MANUAL_INVOICE)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: 'The GET Invoice address manual entry page',
    handler: controller.handler,
    bind: controller
  }
}, {
  method: ['POST'],
  path: controller.path,
  config: {
    description: 'The POST Invoice address manual entry page',
    handler: controller.handler,
    bind: controller,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: AddressManualValidator.prototype.getFormValidators(),
      failAction: controller.failAction
    }
  }
}]
