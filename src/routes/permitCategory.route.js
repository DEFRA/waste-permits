'use strict'

const Constants = require('../constants')
const PermitCategoryController = require('../controllers/PermitCategory.controller')
const PermitCategoryValidator = require('../validators/PermitCategory.validator')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.PERMIT_CATEGORY.path,
  config: {
    description: 'The GET Permit Category page',
    handler: PermitCategoryController.handler
  }
}, {
  method: ['POST'],
  path: Constants.Routes.PERMIT_CATEGORY.path,
  config: {
    description: 'The POST Permit Category page',
    handler: PermitCategoryController.handler,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: PermitCategoryValidator.getFormValidators(),
      failAction: PermitCategoryController.handler
    }
  }
}]
