'use strict'

const Constants = require('../constants')
const SiteGridReferenceController = require('../controllers/siteGridReference.controller')
const SiteGridReferenceValidator = require('../validators/siteGridReference.validator')
const controller = new SiteGridReferenceController(Constants.Routes.SITE_GRID_REFERENCE)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: 'The GET Site Grid Reference page',
    handler: controller.handler,
    bind: controller
  }
}, {
  method: ['POST'],
  path: controller.path,
  config: {
    description: 'The POST Site Grid Reference page',
    handler: controller.handler,
    bind: controller,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: SiteGridReferenceValidator.prototype.getFormValidators(),
      failAction: controller.failAction
    }
  }
}]
