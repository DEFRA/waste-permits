'use strict'

const Constants = require('../constants')
const CompanyStatusController = require('../controllers/companyCheckStatus.controller')
const controller = new CompanyStatusController(Constants.Routes.COMPANY_CHECK_STATUS)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: `The GET We can't issue a permit to that company because it <status>`,
    handler: controller.handler,
    bind: controller,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
