'use strict'

const Constants = require('../constants')
const CompanyNumberController = require('../controllers/companyNumber.controller')
const CompanyNumberValidator = require('../validators/companyNumber.validator')
const controller = new CompanyNumberController(Constants.Routes.COMPANY_NUMBER)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: `The GET What's the company name or registration number?`,
    handler: controller.handler,
    bind: controller
  }
}, {
  method: ['POST'],
  path: controller.path,
  config: {
    description: `The POST What's the company name or registration number?`,
    handler: controller.handler,
    bind: controller,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: CompanyNumberValidator.prototype.getFormValidators(),
      failAction: controller.failAction
    }
  }
}]
