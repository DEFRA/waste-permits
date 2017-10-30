'use strict'

const Constants = require('../constants')
const SiteGridReferenceController = require('../controllers/siteGridReference.controller')
const SiteGridReferenceValidator = require('../validators/siteGridReference.validator')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.SITE_GRID_REFERENCE.path,
  config: {
    description: 'The GET Site Grid Reference page',
    handler: SiteGridReferenceController.handler
  }
}, {
  method: ['POST'],
  path: Constants.Routes.SITE_GRID_REFERENCE.path,
  config: {
    description: 'The POST Site Grid Reference page',
    handler: SiteGridReferenceController.handler,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: SiteGridReferenceValidator.getFormValidators(),
      failAction: SiteGridReferenceController.handler
    }
  }
}]
