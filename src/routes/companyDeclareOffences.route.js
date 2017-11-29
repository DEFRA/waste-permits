'use strict'

const Constants = require('../constants')
const {COMPANY_DECLARE_OFFENCES, COMPANY_DECLARE_BANKRUPTCY} = Constants.Routes
const CompanyDeclareOffencesController = require('../controllers/declareOffences.controller')
const CompanyDeclareOffencesValidator = require('../validators/declareOffences.validator')
const controller = new CompanyDeclareOffencesController(COMPANY_DECLARE_OFFENCES, true, COMPANY_DECLARE_BANKRUPTCY, CompanyDeclareOffencesValidator)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: `The GET Does anyone connected with your business have a conviction for a relevant offence?`,
    handler: controller.handler,
    bind: controller
  }
}, {
  method: ['POST'],
  path: controller.path,
  config: {
    description: `The POST Does anyone connected with your business have a conviction for a relevant offence?`,
    handler: controller.handler,
    bind: controller,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: controller.validator.getFormValidators(),
      failAction: controller.failAction
    }
  }
}]
