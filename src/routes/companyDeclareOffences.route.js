'use strict'

const Constants = require('../constants')
const CompanyDeclareOffencesController = require('../controllers/declareOffences.controller')
const CompanyDeclareOffencesValidator = require('../validators/declareOffences.validator')
const controller = new CompanyDeclareOffencesController(Constants.Routes.COMPANY_DECLARE_OFFENCES)

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
      payload: CompanyDeclareOffencesValidator.getFormValidators(),
      failAction: controller.failAction
    }
  }
}]
