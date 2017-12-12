'use strict'

const Constants = require('../constants')
const {COMPANY_DECLARE_BANKRUPTCY, TASK_LIST} = Constants.Routes
const CompanyDeclareBankruptcyController = require('../controllers/declareBankruptcy.controller')
const CompanyDeclareBankruptcyValidator = require('../validators/declareBankruptcy.validator')
const controller = new CompanyDeclareBankruptcyController(COMPANY_DECLARE_BANKRUPTCY, true, TASK_LIST, CompanyDeclareBankruptcyValidator)

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
      payload: controller.validator.prototype.getFormValidators(),
      failAction: controller.failAction
    }
  }
}]
