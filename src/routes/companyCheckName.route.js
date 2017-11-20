'use strict'

const Constants = require('../constants')
const CompanyCheckNameController = require('../controllers/companyCheckName.controller')
const CompanyCheckNameValidator = require('../validators/companyCheckName.validator')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.COMPANY_CHECK_NAME.path,
  config: {
    description: 'The GET Check Company Name page',
    handler: CompanyCheckNameController.handler
  }
}, {
  method: ['POST'],
  path: Constants.Routes.COMPANY_CHECK_NAME.path,
  config: {
    description: 'The POST Check Company Name page',
    handler: CompanyCheckNameController.handler,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: CompanyCheckNameValidator.getFormValidators(),
      failAction: CompanyCheckNameController.handler
    }
  }
}]
