'use strict'

const Constants = require('../constants')
const CheckYourEmailController = require('../controllers/checkYourEmail.controller')
const CheckYourEmailValidator = require('../validators/checkYourEmail.validator')
const controller = new CheckYourEmailController(Constants.Routes.CHECK_YOUR_EMAIL)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: 'The GET Check Your Email page',
    handler: controller.handler,
    bind: controller
  }
}, {
  method: ['POST'],
  path: controller.path,
  config: {
    description: 'The POST Check Your Email page',
    handler: controller.handler,
    bind: controller,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: CheckYourEmailValidator.getFormValidators(),
      failAction: controller.failAction
    }
  }
}]
