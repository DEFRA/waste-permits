'use strict'

const Constants = require('../constants')
const TechnicalQualificationController = require('../controllers/technicalQualification.controller')
const controller = new TechnicalQualificationController(Constants.Routes.TECHNICAL_QUALIFICATION)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: 'The Which qualification does the person providing technical management have? page',
    handler: controller.handler,
    bind: controller,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
