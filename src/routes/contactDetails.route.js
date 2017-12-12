'use strict'

const Constants = require('../constants')
const ContactDetailsController = require('../controllers/contactDetails.controller')
const ContactDetailsValidator = require('../validators/contactDetails.validator')
const controller = new ContactDetailsController(Constants.Routes.CONTACT_DETAILS)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: 'The GET Contact page',
    handler: controller.handler,
    bind: controller
  }
}, {
  method: ['POST'],
  path: controller.path,
  config: {
    description: 'The POST Contact page',
    handler: controller.handler,
    bind: controller,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: ContactDetailsValidator.prototype.getFormValidators(),
      failAction: controller.failAction
    }
  }
}]
