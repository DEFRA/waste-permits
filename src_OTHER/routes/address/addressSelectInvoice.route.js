'use strict'

const Constants = require('../../constants')
const AddressSelectController = require('../../controllers/address/addressSelect.controller')
const AddressSelectValidator = require('../../validators/address/addressSelect.validator')
const controller = new AddressSelectController(Constants.Routes.ADDRESS.SELECT_INVOICE)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: 'The GET Invoice address select page',
    handler: controller.handler,
    bind: controller
  }
}, {
  method: ['POST'],
  path: controller.path,
  config: {
    description: 'The POST Invoice address select page',
    handler: controller.handler,
    bind: controller,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: AddressSelectValidator.prototype.getFormValidators(),
      failAction: controller.failAction
    }
  }
}]
