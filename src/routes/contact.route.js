'use strict'

const Constants = require('../constants')
const ContactController = require('../controllers/contact.controller')
const ContactValidator = require('../validators/contact.validator')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.CONTACT,
  config: {
    description: 'The GET Contact page',
    handler: ContactController.handler
  }
}, {
  method: ['POST'],
  path: Constants.Routes.CONTACT,
  config: {
    description: 'The POST Contact page',
    handler: ContactController.handler,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: ContactValidator.getFormValidators(),
      failAction: ContactController.handler
    }
  }
}]
