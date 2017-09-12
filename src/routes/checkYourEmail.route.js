'use strict'

const Constants = require('../constants')
const CheckYourEmailController = require('../controllers/CheckYourEmail.controller')
const CheckYourEmailValidator = require('../validators/CheckYourEmail.validator')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.CHECK_YOUR_EMAIL.path,
  config: {
    description: 'The GET Check Your Email page',
    handler: CheckYourEmailController.handler
  }
}, {
  method: ['POST'],
  path: Constants.Routes.CHECK_YOUR_EMAIL.path,
  config: {
    description: 'The POST Check Your Email page',
    handler: CheckYourEmailController.handler,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: CheckYourEmailValidator.getFormValidators(),
      failAction: CheckYourEmailController.handler
    }
  }
}]
