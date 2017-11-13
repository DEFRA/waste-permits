
'use strict'

const Constants = require('../constants')
const CompanyRegNumberController = require('../controllers/companyRegNumber.controller')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.COMPANY_REGISTRATION_NUMBER.path,
  config: {
    description: `The GET 'What's the company name or registration number?`,
    handler: CompanyRegNumberController.handler
  }
}, {
  method: ['POST'],
  path: Constants.Routes.COMPANY_REGISTRATION_NUMBER.path,
  config: {
    description: `The POST 'What's the company name or registration number?`,
    handler: CompanyRegNumberController.handler
  }
}]
