'use strict'

const Constants = require('../constants')
const PermitCategoryController = require('../controllers/permitCategory.controller')
const PermitCategoryValidator = require('../validators/permitCategory.validator')
const controller = new PermitCategoryController(Constants.Routes.PERMIT_CATEGORY)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: 'The GET Permit Category page',
    handler: controller.handler,
    bind: controller
  }
}, {
  method: ['POST'],
  path: controller.path,
  config: {
    description: 'The POST Permit Category page',
    handler: controller.handler,
    bind: controller,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: PermitCategoryValidator.prototype.getFormValidators(),
      failAction: controller.failAction
    }
  }
}]
