'use strict'

const Constants = require('../constants')
const PostcodeController = require('../controllers/postcode.controller')
const PostcodeValidator = require('../validators/postcode.validator')
const controller = new PostcodeController(Constants.Routes.POSTCODE)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: 'The GET Enter Postcode page',
    handler: controller.handler,
    bind: controller
  }
}, {
  method: ['POST'],
  path: controller.path,
  config: {
    description: 'The POST Enter Postcode page',
    handler: controller.handler,
    bind: controller,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: PostcodeValidator.getFormValidators(),
      failAction: controller.failAction
    }
  }
}]
