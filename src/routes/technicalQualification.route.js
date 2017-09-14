'use strict'

const Constants = require('../constants')
const TechnicalQualificationController = require('../controllers/technicalQualification.controller')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.TECHNICAL_QUALIFICATION.path,
  config: {
    description: 'The Which qualification does the person providing technical management have? page',
    handler: TechnicalQualificationController.handler,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
