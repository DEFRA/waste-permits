'use strict'

const Constants = require('../constants')
const ContactDetailsController = require('../controllers/contactDetails.controller')
const ContactDetailsValidator = require('../validators/contactDetails.validator')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.CONTACT_DETAILS.path,
  config: {
    description: 'The GET Contact page',
    handler: ContactDetailsController.handler
  }
}, {
  method: ['POST'],
  path: Constants.Routes.CONTACT_DETAILS.path,
  config: {
    description: 'The POST Contact page',
    handler: ContactDetailsController.handler,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: ContactDetailsValidator.getFormValidators(),
      failAction: ContactDetailsController.handler
    }
  }
}]
