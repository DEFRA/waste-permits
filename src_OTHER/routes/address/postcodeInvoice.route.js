'use strict'

const Constants = require('../../constants')
const PostcodeInvoiceController = require('../../controllers/address/postcodeInvoice.controller')
const PostcodeValidator = require('../../validators/address/postcode.validator')
const controller = new PostcodeInvoiceController(Constants.Routes.ADDRESS.POSTCODE_INVOICE)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: 'The GET Invoice postcode page',
    handler: controller.handler,
    bind: controller
  }
}, {
  method: ['POST'],
  path: controller.path,
  config: {
    description: 'The POST Invoice postcode page',
    handler: controller.handler,
    bind: controller,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: PostcodeValidator.prototype.getFormValidators(),
      failAction: controller.failAction
    }
  }
}]
