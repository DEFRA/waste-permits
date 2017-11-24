'use strict'

const Constants = require('../constants')
const CompanyCheckNameController = require('../controllers/companyCheckName.controller')
const CompanyCheckNameValidator = require('../validators/companyCheckName.validator')
const controller = new CompanyCheckNameController(Constants.Routes.COMPANY_CHECK_NAME)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: 'The GET Check Company Name page',
    handler: controller.handler,
    bind: controller
  }
}, {
  method: ['POST'],
  path: controller.path,
  config: {
    description: 'The POST Check Company Name page',
    handler: controller.handler,
    bind: controller,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: CompanyCheckNameValidator.getFormValidators(),
      failAction: controller.failAction
    }
  }
}]
