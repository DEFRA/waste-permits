'use strict'

const Constants = require('../constants')
const AddressSelectController = require('../controllers/addressSelect.controller')
const AddressSelectValidator = require('../validators/addressSelect.validator')
const controller = new AddressSelectController(Constants.Routes.ADDRESS_SELECT)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: 'The GET Address Select page',
    handler: controller.handler,
    bind: controller
  }
}, {
  method: ['POST'],
  path: controller.path,
  config: {
    description: 'The POST Address Select page',
    handler: controller.handler,
    bind: controller,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: AddressSelectValidator.getFormValidators(),
      failAction: controller.failAction
    }
  }
}]
