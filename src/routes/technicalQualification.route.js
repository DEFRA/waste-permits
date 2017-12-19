'use strict'

const Constants = require('../constants')
const TechnicalQualificationController = require('../controllers/technicalQualification.controller')
const TechnicalQualificationValidator = require('../validators/technicalQualification.validator')
const controller = new TechnicalQualificationController(Constants.Routes.TECHNICAL_QUALIFICATION)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: 'The GET Which qualification does the person providing technical management have? page',
    handler: controller.handler,
    bind: controller,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}, {
  method: ['POST'],
  path: controller.path,
  config: {
    description: 'The POST Which qualification does the person providing technical management have? page',
    handler: controller.handler,
    bind: controller,
    validate: {
      payload: TechnicalQualificationValidator.prototype.getFormValidators(),
      failAction: controller.failAction
    }
  }
}]
