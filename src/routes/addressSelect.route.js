'use strict'

const Constants = require('../constants')
const AddressSelectController = require('../controllers/addressSelect.controller')
const AddressSelectValidator = require('../validators/addressSelect.validator')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.ADDRESS_SELECT.path,
  config: {
    description: 'The GET Address Select page',
    handler: AddressSelectController.handler
  }
}, {
  method: ['POST'],
  path: Constants.Routes.ADDRESS_SELECT.path,
  config: {
    description: 'The POST Address Select page',
    handler: AddressSelectController.handler,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: AddressSelectValidator.getFormValidators(),
      failAction: AddressSelectController.handler
    }
  }
}]
