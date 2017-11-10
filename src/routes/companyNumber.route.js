
'use strict'

const Constants = require('../constants')
const CompanyNumberController = require('../controllers/companyNumber.controller')
const CompanyNumberValidator = require('../validators/companyNumber.validator')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.COMPANY_NUMBER.path,
  config: {
    description: `The GET What's the company name or registration number?`,
    handler: CompanyNumberController.handler
  }
}, {
  method: ['POST'],
  path: Constants.Routes.COMPANY_NUMBER.path,
  config: {
    description: `The POST What's the company name or registration number?`,
    handler: CompanyNumberController.handler,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: CompanyNumberValidator.getFormValidators(),
      failAction: CompanyNumberController.handler
    }
  }
}]
