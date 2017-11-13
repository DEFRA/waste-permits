'use strict'

const Constants = require('../constants')
const PostcodeController = require('../controllers/postcode.controller')
const PostcodeValidator = require('../validators/postcode.validator')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.POSTCODE.path,
  config: {
    description: 'The GET Enter Postcode page',
    handler: PostcodeController.handler
  }
}, {
  method: ['POST'],
  path: Constants.Routes.POSTCODE.path,
  config: {
    description: 'The POST Enter Postcode page',
    handler: PostcodeController.handler,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: PostcodeValidator.getFormValidators(),
      failAction: PostcodeController.handler
    }
  }
}]
