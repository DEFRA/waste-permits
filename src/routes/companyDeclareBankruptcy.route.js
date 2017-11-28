'use strict'

const Constants = require('../constants')
const CompanyDeclareBankruptcyController = require('../controllers/declareBankruptcy.controller')
const CompanyDeclareBankruptcyValidator = require('../validators/declareBankruptcy.validator')
const controller = new CompanyDeclareBankruptcyController(Constants.Routes.COMPANY_DECLARE_BANKRUPTCY)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: `The GET Do you have current or past bankruptcy or insolvency proceedings to declare?`,
    handler: controller.handler,
    bind: controller
  }
}, {
  method: ['POST'],
  path: controller.path,
  config: {
    description: `The POST Do you have current or past bankruptcy or insolvency proceedings to declare?`,
    handler: controller.handler,
    bind: controller,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: CompanyDeclareBankruptcyValidator.getFormValidators(),
      failAction: controller.failAction
    }
  }
}]
