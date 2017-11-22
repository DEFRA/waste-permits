
'use strict'

const Constants = require('../constants')
const CompanyStatusController = require('../controllers/companyCheckStatus.controller')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.COMPANY_CHECK_STATUS.path,
  config: {
    description: `The GET We can't issue a permit to that company because it <status>`,
    handler: CompanyStatusController.handler
  }
}]
